CREATE TABLE `beginner_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` enum('lao','thai') NOT NULL,
	`category` enum('numbers','days','months','time','phrases') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`order` int NOT NULL,
	`difficulty` enum('beginner','intermediate') NOT NULL DEFAULT 'beginner',
	`audioUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `beginner_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`userId` int,
	`language` enum('lao','thai') NOT NULL DEFAULT 'thai',
	`subscriptionType` enum('weekly_phrases','daily_tips','all') NOT NULL DEFAULT 'weekly_phrases',
	`isActive` int NOT NULL DEFAULT 1,
	`lastEmailSentAt` timestamp,
	`unsubscribedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_subscriptions_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`isCompleted` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`lastAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_lesson_progress_id` PRIMARY KEY(`id`)
);
