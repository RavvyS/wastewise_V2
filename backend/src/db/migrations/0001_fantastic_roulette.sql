ALTER TABLE `inquiries` ADD `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `question` text NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `category` text;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `sent_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `responded_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `inquiries` DROP COLUMN `subject`;--> statement-breakpoint
ALTER TABLE `inquiries` DROP COLUMN `message`;--> statement-breakpoint
ALTER TABLE `recycling_centers` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `recycling_centers` ADD `website` text;--> statement-breakpoint
ALTER TABLE `recycling_centers` ADD `hours` text;--> statement-breakpoint
ALTER TABLE `recycling_centers` ADD `services` text;--> statement-breakpoint
ALTER TABLE `recycling_centers` ADD `rating` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `recycling_centers` ADD `latitude` text;--> statement-breakpoint
ALTER TABLE `recycling_centers` ADD `longitude` text;--> statement-breakpoint
ALTER TABLE `recycling_centers` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP;