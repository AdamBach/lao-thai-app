CREATE TABLE `lesson_audio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`itemIndex` int NOT NULL,
	`text` varchar(512) NOT NULL,
	`language` enum('lao','thai') NOT NULL,
	`audioUrl` varchar(512) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_audio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`totalItems` int NOT NULL,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`accuracy` decimal(5,2) NOT NULL DEFAULT '0.00',
	`duration` int NOT NULL DEFAULT 0,
	`isCompleted` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_sessions_id` PRIMARY KEY(`id`)
);
