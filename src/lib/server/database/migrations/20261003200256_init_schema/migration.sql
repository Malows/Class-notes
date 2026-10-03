CREATE TABLE `assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`period_id` integer NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`workflow_status` text DEFAULT 'NOT_DICTATED' NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `fk_assignments_period_id_periods_id_fk` FOREIGN KEY (`period_id`) REFERENCES `periods`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`subject_id` integer NOT NULL,
	`period_id` integer NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `fk_commissions_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_commissions_period_id_periods_id_fk` FOREIGN KEY (`period_id`) REFERENCES `periods`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`assignment_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`workflow_status` text DEFAULT 'NOT_DICTATED' NOT NULL,
	`grade` integer DEFAULT 0,
	`ai_level` integer DEFAULT 0,
	`comments` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `deliveries_pk` PRIMARY KEY(`assignment_id`, `student_id`),
	CONSTRAINT `fk_deliveries_assignment_id_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_deliveries_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `faculties` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text
);
--> statement-breakpoint
CREATE TABLE `periods` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`year` integer NOT NULL,
	`semester` integer NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`commission_id` integer NOT NULL,
	`name` text NOT NULL,
	`external_id` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `fk_students_commission_id_commissions_id_fk` FOREIGN KEY (`commission_id`) REFERENCES `commissions`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `subject_periods` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`subject_id` integer NOT NULL,
	`period_id` integer NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `fk_subject_periods_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_subject_periods_period_id_periods_id_fk` FOREIGN KEY (`period_id`) REFERENCES `periods`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`faculty_id` integer NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `fk_subjects_faculty_id_faculties_id_fk` FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_periods_year_semester_unique` ON `periods` (`year`,`semester`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_subject_periods_subject_period_active` ON `subject_periods` (`subject_id`,`period_id`);