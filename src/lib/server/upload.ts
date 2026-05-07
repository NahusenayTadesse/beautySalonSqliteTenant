import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { env } from '$env/dynamic/private';
import { generateUserId } from '$lib/global.svelte';

const FILES_DIR = env.FILES_DIR ?? '.tempFiles';

// Sibling folder to FILES_DIR — same filesystem = atomic renames work
const PENDING_DIR = path.join(path.dirname(FILES_DIR), 'pending-receipts');

for (const dir of [FILES_DIR, PENDING_DIR]) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── shared low-level writer ───────────────────────────────────────────────

async function writeFile(file: File, targetDir: string, fileName: string): Promise<void> {
	const target = path.join(targetDir, fileName);
	const tmp = `${target}.tmp`;

	try {
		await pipeline(Readable.fromWeb(file.stream()), fs.createWriteStream(tmp));
		fs.renameSync(tmp, target); // atomic on same filesystem — either fully there or not
	} catch (e) {
		try {
			fs.unlinkSync(tmp);
		} catch {
			/* already gone */
		}
		throw e;
	}
}

// ─── public API ───────────────────────────────────────────────────────────

/**
 * Original helper — unchanged behaviour, just hardened with tmp+rename.
 */
export async function saveUploadedFile(file: File | undefined): Promise<string> {
	if (!file) throw new Error('No file provided');
	const fileName = `${generateUserId()}${path.extname(file.name)}`;
	await writeFile(file, FILES_DIR, fileName);
	return fileName;
}

/**
 * Step 1 — called AFTER the transaction commits.
 * Drains the file stream to disk immediately (fast local write).
 * Filename encodes the txnId so recovery can find it.
 * Format: {txnId}--{uid}{ext}
 */
export async function savePendingReceipt(file: File, txnId: number): Promise<void> {
	const fileName = `${txnId}--${generateUserId()}${path.extname(file.name)}`;
	await writeFile(file, PENDING_DIR, fileName);
}

/**
 * Step 2 — moves a pending file into FILES_DIR and returns the final filename.
 * rename() is near-instant because both dirs are on the same filesystem.
 */
export function commitPendingReceipt(pendingFileName: string): string {
	const ext = path.extname(pendingFileName);
	const fileName = `${generateUserId()}${ext}`;
	fs.renameSync(path.join(PENDING_DIR, pendingFileName), path.join(FILES_DIR, fileName));
	return fileName;
}

/**
 * Called once at server start (hooks.server.ts).
 * Commits any receipts that survived a crash before they could be linked.
 * updateFn is injected to avoid importing db here.
 */
export async function reprocessPendingReceipts(
	updateFn: (txnId: number, fileName: string) => Promise<void>
): Promise<void> {
	let files: string[];

	try {
		files = fs.readdirSync(PENDING_DIR).filter((f) => !f.endsWith('.tmp'));
	} catch {
		return; // dir doesn't exist yet, nothing to recover
	}

	for (const pendingFileName of files) {
		const txnId = Number(pendingFileName.split('--')[0]);
		if (isNaN(txnId)) continue;

		try {
			const fileName = commitPendingReceipt(pendingFileName);
			await updateFn(txnId, fileName);
			console.log(`[receipts] recovered txn ${txnId} → ${fileName}`);
		} catch (e) {
			console.error(`[receipts] failed to recover txn ${txnId}:`, e);
			// leave the file in place — next restart will retry
		}
	}
}
