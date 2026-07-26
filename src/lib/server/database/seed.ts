import { drizzle } from "drizzle-orm/better-sqlite3";
import type { Database } from "better-sqlite3";
import * as schema from "./schema";
import { relations } from "./relations";

import {
  assignments,
  commissions,
  deliveries,
  faculties,
  periods,
  students,
  subjectPeriods,
  subjects,
} from "./schema";

const runSafe = (operation: () => void) => {
  try {
    operation();
  } catch {
    // Intentionally ignore individual seed failures so bootstrap remains resilient.
  }
};

export function insertSeed(client: Database): void {
  const db = drizzle({ client, schema, relations } as any);
  const transaction = client.transaction(() => {
    runSafe(() => {
      db
        .insert(faculties)
        .values([ { name: "Facultad de Ingeniería" }, { name: "Facultad de Ciencias Exactas" } ])
        .onConflictDoUpdate({
          target: faculties.id,
          set: { name: faculties.name },
        })
        .run();
    });

    runSafe(() => {
      db
        .insert(subjects)
        .values([
          { facultyId: 1, name: "Álgebra Lineal" },
          { facultyId: 1, name: "Análisis Matemático I" },
          { facultyId: 2, name: "Física General I" },
        ])
        .onConflictDoUpdate({
          target: subjects.id,
          set: { facultyId: subjects.facultyId, name: subjects.name },
        })
        .run();
    });

    runSafe(() => {
      db
        .insert(periods)
        .values([
          { id: 1, year: 2026, semester: 1 },
          { id: 2, year: 2026, semester: 1 },
          { id: 3, year: 2026, semester: 1 },
        ])
        .onConflictDoUpdate({
          target: periods.id,
          set: { year: periods.year, semester: periods.semester },
        })
        .run();
    });

    runSafe(() => {
      db
        .insert(subjectPeriods)
        .values([
          { id: 1, subjectId: 1, periodId: 1 },
          { id: 2, subjectId: 2, periodId: 2 },
          { id: 3, subjectId: 3, periodId: 3 },
        ])
        .onConflictDoUpdate({
          target: subjectPeriods.id,
          set: { subjectId: subjectPeriods.subjectId, periodId: subjectPeriods.periodId },
        })
        .run();
    });

    runSafe(() => {
      db
        .insert(commissions)
        .values([
          { id: 1, periodId: 1, name: "Comisión A" },
          { id: 2, periodId: 1, name: "Comisión B" },
          { id: 3, periodId: 2, name: "Comisión Única" },
        ])
        .onConflictDoUpdate({
          target: commissions.id,
          set: { periodId: commissions.periodId, name: commissions.name },
        })
        .run();
    });

    runSafe(() => {
      db
        .insert(students)
        .values([
          { id: 1, commissionId: 1, name: "Juan Pérez", externalId: "ENG-101" },
          { id: 2, commissionId: 1, name: "María Rodríguez", externalId: "ENG-102" },
          { id: 3, commissionId: 1, name: "Carlos Gómez", externalId: "ENG-103" },
          { id: 4, commissionId: 2, name: "Ana Martínez", externalId: "ENG-201" },
          { id: 5, commissionId: 2, name: "Luis Fernández", externalId: "ENG-202" },
          { id: 6, commissionId: 3, name: "Sofía López", externalId: "MTH-011" },
          { id: 7, commissionId: 2, name: "Pedro Picapiedra", externalId: "ENG-203" },
          { id: 8, commissionId: 2, name: "Vilma Picapiedra", externalId: "ENG-204" },
          { id: 9, commissionId: 3, name: "Pablo Mármol", externalId: "MTH-012" },
          { id: 10, commissionId: 3, name: "Betty Mármol", externalId: "MTH-013" },
          { id: 11, commissionId: 1, name: "Hugo Silva", externalId: "ENG-104" },
        ])
        .onConflictDoUpdate({
          target: students.id,
          set: {
            commissionId: students.commissionId,
            name: students.name,
            externalId: students.externalId,
          },
        })
        .run();
    });

    runSafe(() => {
      db
        .insert(assignments)
        .values([
          {
            id: 1,
            periodId: 1,
            title: "Trabajo Práctico 1",
            subtitle: "Espacios Vectoriales",
            workflowStatus: "WAITING_FOR_CORRECTION",
          },
          {
            id: 2,
            periodId: 1,
            title: "Trabajo Práctico 2",
            subtitle: "Matrices y Determinantes",
            workflowStatus: "WAITING_FOR_STUDENTS",
          },
          {
            id: 3,
            periodId: 2,
            title: "Trabajo Práctico 1",
            subtitle: "Límites y Continuidad",
            workflowStatus: "WAITING_FOR_STUDENTS",
          },
          {
            id: 4,
            periodId: 3,
            title: "Guía de Problemas 1",
            subtitle: "Cinemática",
            workflowStatus: "NOT_DICTATED",
          },
          {
            id: 5,
            periodId: 2,
            title: "Trabajo Práctico 2",
            subtitle: "Integrales y Aplicaciones",
            workflowStatus: "WAITING_FOR_CORRECTION",
          },
        ])
        .onConflictDoUpdate({
          target: assignments.id,
          set: {
            periodId: assignments.periodId,
            title: assignments.title,
            subtitle: assignments.subtitle,
            workflowStatus: assignments.workflowStatus,
          },
        })
        .run();
    });

    runSafe(() => {
      db
        .insert(deliveries)
        .values([
          { assignmentId: 1, studentId: 1, workflowStatus: "APPROVED", grade: 8.5, aiLevel: 0, comments: "Excelente planteo de los ejercicios de subespacios." },
          { assignmentId: 1, studentId: 2, workflowStatus: "WAITING_FOR_CORRECTION", grade: 6.0, aiLevel: 1, comments: "Aprobado con lo justo. Prestar atención al uso de IA." },
          { assignmentId: 1, studentId: 3, workflowStatus: "REJECTED", grade: 4.0, aiLevel: 0, comments: "Faltaron resolver los puntos 3 y 4. Debe rehacer." },
          { assignmentId: 1, studentId: 11, workflowStatus: "APPROVED", grade: 7.5, aiLevel: 2, comments: "Resuelto correctamente, pero detectamos código autogenerado." },
          { assignmentId: 2, studentId: 1, workflowStatus: "APPROVED", grade: 9.0, aiLevel: 0, comments: "Perfecto uso de las propiedades del determinante." },
          { assignmentId: 2, studentId: 2, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "No entregado." },
          { assignmentId: 2, studentId: 3, workflowStatus: "NOT_DICTATED", grade: 0, aiLevel: 0, comments: "Tema aún no dictado." },
          { assignmentId: 2, studentId: 11, workflowStatus: "REJECTED", grade: 2.0, aiLevel: 2, comments: "Plagio descarado con IA, no supo justificar en el coloquio." },
          { assignmentId: 1, studentId: 4, workflowStatus: "APPROVED", grade: 7.0, aiLevel: 1, comments: "Buen desarrollo, pero con respuestas redactadas sospechosamente por IA." },
          { assignmentId: 1, studentId: 5, workflowStatus: "APPROVED", grade: 10.0, aiLevel: 0, comments: "Trabajo perfecto y sumamente original." },
          { assignmentId: 1, studentId: 7, workflowStatus: "WAITING_FOR_CORRECTION", grade: 0, aiLevel: 0, comments: "Pendiente de corregir." },
          { assignmentId: 1, studentId: 8, workflowStatus: "REJECTED", grade: 3.0, aiLevel: 1, comments: "Respuestas inconsistentes e indicios claros de copy-paste de IA." },
          { assignmentId: 2, studentId: 4, workflowStatus: "REJECTED", grade: 2.0, aiLevel: 2, comments: "Certeza absoluta de plagio/generación por IA sin edición." },
          { assignmentId: 2, studentId: 5, workflowStatus: "WAITING_FOR_CORRECTION", grade: 8.0, aiLevel: 2, comments: "Entregado. Sospecha muy alta de código copiado directamente de ChatGPT." },
          { assignmentId: 2, studentId: 7, workflowStatus: "APPROVED", grade: 8.5, aiLevel: 1, comments: "Bien resuelto, con ligera ayuda de IA en los comentarios." },
          { assignmentId: 2, studentId: 8, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "No entregado aún." },
          { assignmentId: 3, studentId: 6, workflowStatus: "APPROVED", grade: 7.5, aiLevel: 2, comments: "Buen desarrollo, pero hay bloques de código sospechosos de IA." },
          { assignmentId: 3, studentId: 9, workflowStatus: "APPROVED", grade: 9.0, aiLevel: 0, comments: "Excelente trabajo matemático." },
          { assignmentId: 3, studentId: 10, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "Falta entregar." },
          { assignmentId: 5, studentId: 6, workflowStatus: "WAITING_FOR_CORRECTION", grade: 0, aiLevel: 1, comments: "Entregado a término." },
          { assignmentId: 5, studentId: 9, workflowStatus: "REJECTED", grade: 2.0, aiLevel: 2, comments: "Fraude académico detectado mediante análisis de patrones." },
          { assignmentId: 5, studentId: 10, workflowStatus: "NOT_DICTATED", grade: 0, aiLevel: 0, comments: "Tema aún no dictado para este alumno." },
        ])
        .onConflictDoUpdate({
          target: [deliveries.assignmentId, deliveries.studentId],
          set: {
            workflowStatus: deliveries.workflowStatus,
            grade: deliveries.grade,
            aiLevel: deliveries.aiLevel,
            comments: deliveries.comments,
          },
        })
        .run();
    });
  });

  transaction();
}
