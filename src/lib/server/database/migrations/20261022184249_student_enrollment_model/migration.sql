CREATE TABLE `persons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`legajo` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`person_id` integer NOT NULL,
	`subject_period_id` integer NOT NULL,
	`commission_id` integer,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `fk_enrollments_person_id_persons_id_fk` FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_enrollments_subject_period_id_subject_periods_id_fk` FOREIGN KEY (`subject_period_id`) REFERENCES `subject_periods`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_enrollments_commission_id_commissions_id_fk` FOREIGN KEY (`commission_id`) REFERENCES `commissions`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
-- Backfill 1/3: every commission needs a cursada (subject x period) for its students to enroll in.
INSERT INTO `subject_periods` (`subject_id`, `period_id`)
SELECT c.`subject_id`, c.`period_id`
FROM `commissions` c
WHERE c.`deletedAt` IS NULL
	AND NOT EXISTS (
		SELECT 1 FROM `subject_periods` sp
		WHERE sp.`subject_id` = c.`subject_id`
			AND sp.`period_id` = c.`period_id`
			AND sp.`deletedAt` IS NULL
	);
--> statement-breakpoint
-- Backfill 2/3: one person per student, keeping ids so enrollment ids stay stable.
INSERT INTO `persons` (`id`, `name`, `legajo`, `createdAt`, `updatedAt`, `deletedAt`)
SELECT s.`id`, s.`name`, s.`external_id`, s.`createdAt`, s.`updatedAt`, s.`deletedAt`
FROM `students` s;
--> statement-breakpoint
-- Backfill 3/3: one enrollment per student in the cursada of its commission.
INSERT INTO `enrollments` (`id`, `person_id`, `subject_period_id`, `commission_id`, `createdAt`, `updatedAt`, `deletedAt`)
SELECT
	s.`id`,
	s.`id`,
	(
		SELECT sp.`id`
		FROM `subject_periods` sp
		JOIN `commissions` c ON c.`subject_id` = sp.`subject_id` AND c.`period_id` = sp.`period_id`
		WHERE c.`id` = s.`commission_id` AND sp.`deletedAt` IS NULL
		ORDER BY sp.`id`
		LIMIT 1
	),
	s.`commission_id`,
	s.`createdAt`,
	s.`updatedAt`,
	s.`deletedAt`
FROM `students` s;
--> statement-breakpoint
-- assignments now belong to a cursada. The cursada of a pre-existing TP cannot be
-- derived (a TP was shared by every subject of its period), and keeping its deliveries
-- would link an assignment to an enrollment of a different cursada. Both tables are
-- recreated empty; TPs and deliveries are re-created or reseeded.
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`subject_period_id` integer NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`workflow_status` text DEFAULT 'NOT_DICTATED' NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `fk_assignments_subject_period_id_subject_periods_id_fk` FOREIGN KEY (`subject_period_id`) REFERENCES `subject_periods`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
DROP TABLE `assignments`;
--> statement-breakpoint
ALTER TABLE `__new_assignments` RENAME TO `assignments`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_deliveries` (
	`assignment_id` integer NOT NULL,
	`enrollment_id` integer NOT NULL,
	`workflow_status` text DEFAULT 'NOT_DICTATED' NOT NULL,
	`grade` integer DEFAULT 0,
	`ai_level` integer DEFAULT 0,
	`comments` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `deliveries_pk` PRIMARY KEY(`assignment_id`, `enrollment_id`),
	CONSTRAINT `fk_deliveries_assignment_id_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_deliveries_enrollment_id_enrollments_id_fk` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
DROP TABLE `deliveries`;
--> statement-breakpoint
ALTER TABLE `__new_deliveries` RENAME TO `deliveries`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
DROP TABLE `students`;
--> statement-breakpoint
DROP INDEX IF EXISTS `idx_subject_periods_subject_period_active`;
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_subject_periods_subject_period_active` ON `subject_periods` (`subject_id`,`period_id`) WHERE "subject_periods"."deletedAt" IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_enrollments_person_subject_period_unique` ON `enrollments` (`person_id`,`subject_period_id`) WHERE "enrollments"."deletedAt" IS NULL;
--> statement-breakpoint
CREATE INDEX `idx_enrollments_commission` ON `enrollments` (`commission_id`);
--> statement-breakpoint
CREATE INDEX `idx_enrollments_subject_period` ON `enrollments` (`subject_period_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_persons_legajo_unique` ON `persons` (`legajo`) WHERE "persons"."deletedAt" IS NULL AND "persons"."legajo" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX `idx_persons_name` ON `persons` (`name`);
