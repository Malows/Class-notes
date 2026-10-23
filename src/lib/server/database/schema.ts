import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const faculties = sqliteTable(
  "faculties",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt", { mode: "text" }),
  },
  (table) => ({
    uniqueSlug: uniqueIndex("idx_faculties_slug_unique")
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const subjects = sqliteTable(
  "subjects",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    facultyId: integer("faculty_id", { mode: "number" })
      .notNull()
      .references(() => faculties.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt", { mode: "text" }),
  },
  (table) => ({
    uniqueFacultySlug: uniqueIndex("idx_subjects_faculty_slug_unique")
      .on(table.facultyId, table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const periods = sqliteTable(
  "periods",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    year: integer("year").notNull(),
    semester: integer("semester").notNull(),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt", { mode: "text" }),
  },
  (table) => ({
    uniqueYearSemester: uniqueIndex("idx_periods_year_semester_unique").on(
      table.year,
      table.semester,
    ),
  }),
);

export const subjectPeriods = sqliteTable(
  "subject_periods",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    subjectId: integer("subject_id", { mode: "number" })
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    periodId: integer("period_id", { mode: "number" })
      .notNull()
      .references(() => periods.id, { onDelete: "cascade" }),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt", { mode: "text" }),
  },
  (table) => ({
    uniqueSubjectPeriodActive: uniqueIndex("idx_subject_periods_subject_period_active")
      .on(table.subjectId, table.periodId)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const commissions = sqliteTable(
  "commissions",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    subjectId: integer("subject_id", { mode: "number" })
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    periodId: integer("period_id", { mode: "number" })
      .notNull()
      .references(() => periods.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt", { mode: "text" }),
  },
  (table) => ({
    uniqueSubjectPeriodSlug: uniqueIndex("idx_commissions_subject_period_slug_unique").on(
      table.subjectId,
      table.periodId,
      table.slug,
    ).where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const persons = sqliteTable(
  "persons",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    legajo: text("legajo"),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt"),
  },
  (table) => ({
    uniqueLegajo: uniqueIndex("idx_persons_legajo_unique")
      .on(table.legajo)
      .where(sql`${table.deletedAt} IS NULL AND ${table.legajo} IS NOT NULL`),
    byName: index("idx_persons_name").on(table.name),
  }),
);

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    personId: integer("person_id", { mode: "number" })
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    subjectPeriodId: integer("subject_period_id", { mode: "number" })
      .notNull()
      .references(() => subjectPeriods.id, { onDelete: "cascade" }),
    commissionId: integer("commission_id", { mode: "number" }).references(() => commissions.id, {
      onDelete: "set null",
    }),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt"),
  },
  (table) => ({
    uniquePersonCursada: uniqueIndex("idx_enrollments_person_subject_period_unique")
      .on(table.personId, table.subjectPeriodId)
      .where(sql`${table.deletedAt} IS NULL`),
    byCommission: index("idx_enrollments_commission").on(table.commissionId),
    bySubjectPeriod: index("idx_enrollments_subject_period").on(table.subjectPeriodId),
  }),
);

export const assignments = sqliteTable("assignments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  subjectPeriodId: integer("subject_period_id", { mode: "number" })
    .notNull()
    .references(() => subjectPeriods.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  workflowStatus: text("workflow_status").notNull().default("NOT_DICTATED"),
  createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  deletedAt: text("deletedAt", { mode: "text" }),
});

export const deliveries = sqliteTable(
  "deliveries",
  {
    assignmentId: integer("assignment_id", { mode: "number" })
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    enrollmentId: integer("enrollment_id", { mode: "number" })
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    workflowStatus: text("workflow_status").notNull().default("NOT_DICTATED"),
    grade: integer("grade", { mode: "number" }).default(0),
    aiLevel: integer("ai_level", { mode: "number" }).default(0),
    comments: text("comments"),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt", { mode: "text" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.assignmentId, table.enrollmentId] }),
  }),
);
