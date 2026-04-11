CREATE TABLE `challenge_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`isCompleted` int NOT NULL DEFAULT 0,
	`xpEarned` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenge_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`language` enum('lao','thai') NOT NULL,
	`targetCount` int NOT NULL,
	`xpReward` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_challenges_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_challenges_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `pronunciation_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` enum('lao','thai') NOT NULL,
	`word` varchar(255) NOT NULL,
	`romanization` varchar(255) NOT NULL,
	`englishTranslation` varchar(255) NOT NULL,
	`koreanTranslation` varchar(255) NOT NULL,
	`chineseTranslation` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`audioUrl` varchar(512),
	`tonePattern` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pronunciation_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pronunciation_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`audioUrl` varchar(512) NOT NULL,
	`transcribedText` text,
	`accuracyScore` decimal(5,2),
	`feedback` text,
	`pitchData` json,
	`duration` int,
	`attempts` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pronunciation_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalXP` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`streak` int NOT NULL DEFAULT 0,
	`totalPronunciationAttempts` int NOT NULL DEFAULT 0,
	`averageAccuracy` decimal(5,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_statistics_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_statistics_userId_unique` UNIQUE(`userId`)
);
