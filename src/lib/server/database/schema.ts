import { sqliteTable, text, integer, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";

export const faculties = sqliteTable("faculties", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  deletedAt: text("deletedAt", { mode: "text" }),
});

export const subjects = sqliteTable("subjects", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  facultyId: integer("faculty_id", { mode: "number" })
    .notNull()
    .references(() => faculties.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  deletedAt: text("deletedAt", { mode: "text" }),
});

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
    uniqueSubjectPeriodActive: uniqueIndex("idx_subject_periods_subject_period_active").on(
      table.subjectId,
      table.periodId,
    ),
  }),
);

export const commissions = sqliteTable("commissions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  subjectId: integer("subject_id", { mode: "number" })
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  periodId: integer("period_id", { mode: "number" })
    .notNull()
    .references(() => periods.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  deletedAt: text("deletedAt", { mode: "text" }),
});

export const students = sqliteTable("students", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  commissionId: integer("commission_id", { mode: "number" })
    .notNull()
    .references(() => commissions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  externalId: text("external_id"),
  createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
  deletedAt: text("deletedAt", { mode: "text" }),
});

export const assignments = sqliteTable("assignments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  periodId: integer("period_id", { mode: "number" })
    .notNull()
    .references(() => periods.id, { onDelete: "cascade" }),
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
    studentId: integer("student_id", { mode: "number" })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    workflowStatus: text("workflow_status").notNull().default("NOT_DICTATED"),
    grade: integer("grade", { mode: "number" }).default(0),
    aiLevel: integer("ai_level", { mode: "number" }).default(0),
    comments: text("comments"),
    createdAt: text("createdAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    updatedAt: text("updatedAt", { mode: "text" }).default("CURRENT_TIMESTAMP"),
    deletedAt: text("deletedAt", { mode: "text" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.assignmentId, table.studentId] }),
  }),
);
