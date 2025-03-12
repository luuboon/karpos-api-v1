CREATE TABLE `appointments` (
	`id_ap` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`description` text,
	`patient_id` integer NOT NULL,
	`doctor_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id_dc` integer PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`apellido_p` text NOT NULL,
	`apellido_m` text NOT NULL,
	`prof_id` text NOT NULL,
	`id_us` integer NOT NULL,
	FOREIGN KEY (`id_us`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_prof_id_unique` ON `doctors` (`prof_id`);--> statement-breakpoint
CREATE TABLE `medical_records` (
	`id_mr` integer PRIMARY KEY NOT NULL,
	`id_pc` integer NOT NULL,
	`diagnosis` text NOT NULL,
	`treatment` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`id_pc`) REFERENCES `patients`(`id_pc`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id_pc` integer PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`apellido_p` text NOT NULL,
	`apellido_m` text NOT NULL,
	`age` integer NOT NULL,
	`weight` real NOT NULL,
	`height` real NOT NULL,
	`gender` text NOT NULL,
	`blood_type` text NOT NULL,
	`id_us` integer NOT NULL,
	FOREIGN KEY (`id_us`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX "doctors_prof_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "password" TO "password" text NOT NULL DEFAULT '';--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);