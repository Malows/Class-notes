CREATE UNIQUE INDEX `idx_assignments_id_subject_period_unique` ON `assignments` (`id`,`subject_period_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_enrollments_id_subject_period_unique` ON `enrollments` (`id`,`subject_period_id`);--> statement-breakpoint
CREATE TABLE `attendances` (
	`assignment_id` integer NOT NULL,
	`enrollment_id` integer NOT NULL,
	`subject_period_id` integer NOT NULL,
	`commission_id` integer,
	`status` text NOT NULL,
	`recorded_on` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	CONSTRAINT `attendances_pk` PRIMARY KEY(`assignment_id`, `enrollment_id`),
	CONSTRAINT `fk_attendances_commission_id_commissions_id_fk` FOREIGN KEY (`commission_id`) REFERENCES `commissions`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_attendances_assignment_cursada` FOREIGN KEY (`assignment_id`,`subject_period_id`) REFERENCES `assignments`(`id`,`subject_period_id`) ON DELETE CASCADE,
	CONSTRAINT `fk_attendances_enrollment_cursada` FOREIGN KEY (`enrollment_id`,`subject_period_id`) REFERENCES `enrollments`(`id`,`subject_period_id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `idx_attendances_subject_period` ON `attendances` (`subject_period_id`);--> statement-breakpoint
CREATE INDEX `idx_attendances_commission` ON `attendances` (`commission_id`);--> statement-breakpoint
CREATE INDEX `idx_attendances_status` ON `attendances` (`status`);
