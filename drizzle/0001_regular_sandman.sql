PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category_id` integer,
	`description` text,
	`price` real NOT NULL,
	`duration_minutes` integer,
	`commission_amount` real,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`updated_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`branch_id` integer,
	`deleted_at` integer,
	`deleted_by` text,
	FOREIGN KEY (`category_id`) REFERENCES `service_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`deleted_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_services`("id", "name", "category_id", "description", "price", "duration_minutes", "commission_amount", "is_active", "created_by", "updated_by", "created_at", "updated_at", "branch_id", "deleted_at", "deleted_by") SELECT "id", "name", "category_id", "description", "price", "duration_minutes", "commission_amount", "is_active", "created_by", "updated_by", "created_at", "updated_at", "branch_id", "deleted_at", "deleted_by" FROM `services`;--> statement-breakpoint
DROP TABLE `services`;--> statement-breakpoint
ALTER TABLE `__new_services` RENAME TO `services`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `services_name_unique` ON `services` (`name`);