CREATE TABLE `applicants` (
	`id` int NOT NULL,
	`biography` text,
	`date_of_birth` datetime,
	`nationality` varchar(100),
	`marital_status` enum('single','married','divorced'),
	`gender` enum('male','female','other'),
	`education` enum('none','high school','undergraduate','masters','phd'),
	`experience` text,
	`website_url` varchar(255),
	`location` varchar(255),
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applicants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employers` (
	`id` int NOT NULL,
	`name` varchar(255),
	`description` text,
	`avatar_url` text,
	`banner_image_url` text,
	`organization_type` varchar(100),
	`team_size` varchar(50),
	`year_of_establishment` year,
	`website_url` varchar(255),
	`location` varchar(255),
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`user_agent` text NOT NULL,
	`ip` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`username` varchar(255),
	`password` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('admin','employer','applicant') DEFAULT 'applicant',
	`number` varchar(255),
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `applicants` ADD CONSTRAINT `applicants_id_users_id_fk` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employers` ADD CONSTRAINT `employers_id_users_id_fk` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;