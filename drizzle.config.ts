import { defineConfig } from 'drizzle-kit';

// Points at a template/reference db just for generating migrations
// This file is never used at runtime
export default defineConfig({
	schema: './src/lib/server/db/schema',
	dialect: 'sqlite',
	dbCredentials: {
		url: 'file:databases/_template.db'
	},
	verbose: true,
	strict: true
});
