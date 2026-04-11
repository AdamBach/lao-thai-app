CREATE TABLE `cu_tfl_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelName` varchar(50) NOT NULL,
	`levelCode` varchar(20) NOT NULL,
	`levelOrder` int NOT NULL,
	`description` text,
	`minXP` int NOT NULL,
	`minAccuracy` int NOT NULL,
	`minConsecutiveDays` int NOT NULL,
	`estimatedMonths` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cu_tfl_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `cu_tfl_levels_levelCode_unique` UNIQUE(`levelCode`)
);
--> statement-breakpoint
CREATE TABLE `level_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`levelId` int NOT NULL,
	`achievedAt` timestamp NOT NULL DEFAULT (now()),
	`totalDaysToReach` int NOT NULL,
	`totalXPEarned` int NOT NULL,
	`finalAccuracy` decimal(5,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `level_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`goalType` enum('daily','weekly','monthly','quarterly','annual') NOT NULL,
	`targetXP` int NOT NULL,
	`targetAccuracy` int NOT NULL,
	`targetExercises` int NOT NULL,
	`targetConsecutiveDays` int NOT NULL,
	`currentXP` int NOT NULL DEFAULT 0,
	`currentAccuracy` decimal(5,2) NOT NULL DEFAULT '0.00',
	`currentExercises` int NOT NULL DEFAULT 0,
	`currentConsecutiveDays` int NOT NULL DEFAULT 0,
	`isCompleted` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_roadmaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromLevelId` int NOT NULL,
	`toLevelId` int NOT NULL,
	`goalType` enum('general','test') NOT NULL DEFAULT 'general',
	`durationDays` int NOT NULL,
	`dailyXPTarget` int NOT NULL,
	`weeklyXPTarget` int NOT NULL,
	`monthlyXPTarget` int NOT NULL,
	`requiredAccuracy` int NOT NULL,
	`requiredConsecutiveDays` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_roadmaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_proficiency_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentLevelId` int NOT NULL,
	`targetLevelId` int NOT NULL,
	`goalType` enum('general','test') NOT NULL DEFAULT 'general',
	`currentXP` int NOT NULL DEFAULT 0,
	`targetXP` int NOT NULL,
	`currentAccuracy` decimal(5,2) NOT NULL DEFAULT '0.00',
	`currentConsecutiveDays` int NOT NULL DEFAULT 0,
	`maxConsecutiveDays` int NOT NULL DEFAULT 0,
	`levelUpAt` timestamp,
	`estimatedTargetDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_proficiency_levels_id` PRIMARY KEY(`id`)
);
