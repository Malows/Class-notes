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

const facultySeeds = [
  { id: 1, name: "Facultad de Ingeniería" },
  { id: 2, name: "Facultad de Ciencias Exactas" },
  { id: 3, name: "Facultad de Humanidades y Artes" },
];

const subjectSeeds = [
  { id: 1, facultyId: 1, name: "Álgebra Lineal" },
  { id: 2, facultyId: 1, name: "Análisis Matemático I" },
  { id: 3, facultyId: 1, name: "Física General I" },
  { id: 4, facultyId: 2, name: "Cálculo Diferencial" },
  { id: 5, facultyId: 2, name: "Cálculo Integral" },
  { id: 6, facultyId: 2, name: "Geometría Analítica" },
  { id: 7, facultyId: 3, name: "Historia de la Ciencia" },
  { id: 8, facultyId: 3, name: "Comunicación y Diseño" },
];

const periodSeeds = [
  { id: 1, year: 2024, semester: 2 },
  { id: 2, year: 2025, semester: 1 },
  { id: 3, year: 2025, semester: 2 },
  { id: 4, year: 2026, semester: 1 },
  { id: 5, year: 2026, semester: 2 },
];

const subjectPeriodSeeds = [
  { id: 1, subjectId: 1, periodId: 2 },
  { id: 2, subjectId: 2, periodId: 3 },
  { id: 3, subjectId: 3, periodId: 4 },
  { id: 4, subjectId: 4, periodId: 1 },
  { id: 5, subjectId: 5, periodId: 2 },
  { id: 6, subjectId: 6, periodId: 3 },
  { id: 7, subjectId: 7, periodId: 4 },
  { id: 8, subjectId: 8, periodId: 1 },
  { id: 9, subjectId: 1, periodId: 1 },
  { id: 10, subjectId: 1, periodId: 3 },
  { id: 11, subjectId: 1, periodId: 4 },
  { id: 12, subjectId: 2, periodId: 1 },
  { id: 13, subjectId: 2, periodId: 2 },
  { id: 14, subjectId: 2, periodId: 4 },
  { id: 15, subjectId: 1, periodId: 5 },
  { id: 16, subjectId: 2, periodId: 5 },
  { id: 17, subjectId: 3, periodId: 5 },
  { id: 18, subjectId: 7, periodId: 5 },
];

const commissionSeeds = [
  { id: 1, subjectId: 1, periodId: 2, name: "Comisión Mañana" },
  { id: 2, subjectId: 1, periodId: 2, name: "Comisión Tarde" },
  { id: 3, subjectId: 2, periodId: 3, name: "Comisión Única" },
  { id: 4, subjectId: 3, periodId: 4, name: "Comisión Virtual" },
  { id: 5, subjectId: 4, periodId: 1, name: "Comisión A" },
  { id: 6, subjectId: 4, periodId: 1, name: "Comisión B" },
  { id: 7, subjectId: 5, periodId: 2, name: "Comisión 1" },
  { id: 8, subjectId: 5, periodId: 2, name: "Comisión 2" },
  { id: 9, subjectId: 6, periodId: 3, name: "Comisión Noche" },
  { id: 10, subjectId: 7, periodId: 4, name: "Comisión Taller" },
  { id: 11, subjectId: 8, periodId: 1, name: "Comisión Diseño" },
  { id: 12, subjectId: 8, periodId: 1, name: "Comisión Comunicación" },
];

const studentSeeds = [
  { id: 1, commissionId: 1, name: "Juan Pérez", externalId: "ING-001" },
  { id: 2, commissionId: 1, name: "María Rodríguez", externalId: "ING-002" },
  { id: 3, commissionId: 1, name: "Carlos Gómez", externalId: "ING-003" },
  { id: 4, commissionId: 1, name: "Ana Martínez", externalId: "ING-004" },
  { id: 5, commissionId: 2, name: "Luis Fernández", externalId: "ING-005" },
  { id: 6, commissionId: 2, name: "Sofía López", externalId: "ING-006" },
  { id: 7, commissionId: 2, name: "Tomás Benítez", externalId: "ING-007" },
  { id: 8, commissionId: 2, name: "Valentina Ruiz", externalId: "ING-008" },
  { id: 9, commissionId: 3, name: "Nicolás Vega", externalId: "MAT-001" },
  { id: 10, commissionId: 3, name: "Paula Sosa", externalId: "MAT-002" },
  { id: 11, commissionId: 3, name: "Mateo Ibarra", externalId: "MAT-003" },
  { id: 12, commissionId: 3, name: "Camila Ortega", externalId: "MAT-004" },
  { id: 13, commissionId: 4, name: "Diego Montalvo", externalId: "FIS-001" },
  { id: 14, commissionId: 4, name: "Lucía Domínguez", externalId: "FIS-002" },
  { id: 15, commissionId: 4, name: "Bruno Álvarez", externalId: "FIS-003" },
  { id: 16, commissionId: 4, name: "Florencia Torres", externalId: "FIS-004" },
  { id: 17, commissionId: 5, name: "Agustín Ríos", externalId: "CAL-001" },
  { id: 18, commissionId: 5, name: "Micaela Prado", externalId: "CAL-002" },
  { id: 19, commissionId: 6, name: "Julián Paredes", externalId: "CAL-003" },
  { id: 20, commissionId: 6, name: "Renata Núñez", externalId: "CAL-004" },
  { id: 21, commissionId: 7, name: "Emilia Castro", externalId: "CAL-005" },
  { id: 22, commissionId: 7, name: "Leandro Acosta", externalId: "CAL-006" },
  { id: 23, commissionId: 8, name: "Noelia Salazar", externalId: "CAL-007" },
  { id: 24, commissionId: 8, name: "Federico Paz", externalId: "CAL-008" },
  { id: 25, commissionId: 9, name: "Milagros Benavides", externalId: "GEO-001" },
  { id: 26, commissionId: 9, name: "Santiago Roldán", externalId: "GEO-002" },
  { id: 27, commissionId: 10, name: "Elena Quiroga", externalId: "HIS-001" },
  { id: 28, commissionId: 10, name: "Tomás Ledesma", externalId: "HIS-002" },
  { id: 29, commissionId: 11, name: "Cecilia Mora", externalId: "DIS-001" },
  { id: 30, commissionId: 11, name: "Pablo Cárdenas", externalId: "DIS-002" },
  { id: 31, commissionId: 12, name: "Natalia Ferrer", externalId: "COM-001" },
  { id: 32, commissionId: 12, name: "Gonzalo Varela", externalId: "COM-002" },
];

const assignmentSeeds = [
  { id: 1, periodId: 2, title: "Trabajo Práctico 1", subtitle: "Espacios Vectoriales", workflowStatus: "WAITING_FOR_CORRECTION" },
  { id: 2, periodId: 2, title: "Trabajo Práctico 2", subtitle: "Matrices y Determinantes", workflowStatus: "WAITING_FOR_STUDENTS" },
  { id: 3, periodId: 3, title: "Trabajo Práctico 1", subtitle: "Límites y Continuidad", workflowStatus: "WAITING_FOR_STUDENTS" },
  { id: 4, periodId: 4, title: "Guía de Problemas 1", subtitle: "Cinemática", workflowStatus: "NOT_DICTATED" },
  { id: 5, periodId: 3, title: "Trabajo Práctico 2", subtitle: "Integrales y Aplicaciones", workflowStatus: "WAITING_FOR_CORRECTION" },
  { id: 6, periodId: 1, title: "Ensayo breve", subtitle: "Historia de la ciencia y el método", workflowStatus: "APPROVED" },
  { id: 7, periodId: 4, title: "Proyecto de diseño", subtitle: "Identidad visual para la asignatura", workflowStatus: "WAITING_FOR_CORRECTION" },
  { id: 8, periodId: 1, title: "Análisis de caso", subtitle: "Comunicación efectiva en clase", workflowStatus: "WAITING_FOR_STUDENTS" },
];

const deliverySeeds = [
  { assignmentId: 1, studentId: 1, workflowStatus: "APPROVED", grade: 8, aiLevel: 0, comments: "Excelente planteo de los ejercicios de subespacios." },
  { assignmentId: 1, studentId: 2, workflowStatus: "WAITING_FOR_CORRECTION", grade: 6, aiLevel: 1, comments: "Aprobado con lo justo. Prestar atención al uso de IA." },
  { assignmentId: 1, studentId: 3, workflowStatus: "REJECTED", grade: 4, aiLevel: 0, comments: "Faltaron resolver los puntos 3 y 4. Debe rehacer." },
  { assignmentId: 1, studentId: 4, workflowStatus: "APPROVED", grade: 7, aiLevel: 1, comments: "Buen desarrollo, pero con respuestas redactadas sospechosamente por IA." },
  { assignmentId: 1, studentId: 5, workflowStatus: "APPROVED", grade: 10, aiLevel: 0, comments: "Trabajo perfecto y sumamente original." },
  { assignmentId: 1, studentId: 6, workflowStatus: "WAITING_FOR_CORRECTION", grade: 5, aiLevel: 2, comments: "Entregado con varias respuestas genéricas y poco desarrollo." },
  { assignmentId: 1, studentId: 7, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "No entregado aún." },
  { assignmentId: 2, studentId: 1, workflowStatus: "APPROVED", grade: 9, aiLevel: 0, comments: "Perfecto uso de las propiedades del determinante." },
  { assignmentId: 2, studentId: 2, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "No entregado." },
  { assignmentId: 2, studentId: 3, workflowStatus: "NOT_DICTATED", grade: 0, aiLevel: 0, comments: "Tema aún no dictado." },
  { assignmentId: 2, studentId: 4, workflowStatus: "REJECTED", grade: 2, aiLevel: 2, comments: "Certeza absoluta de plagio y generación por IA sin edición." },
  { assignmentId: 2, studentId: 5, workflowStatus: "WAITING_FOR_CORRECTION", grade: 8, aiLevel: 2, comments: "Entregado. Sospecha muy alta de código copiado directamente de ChatGPT." },
  { assignmentId: 2, studentId: 6, workflowStatus: "APPROVED", grade: 8, aiLevel: 1, comments: "Bien resuelto, con ligera ayuda de IA en los comentarios." },
  { assignmentId: 3, studentId: 9, workflowStatus: "APPROVED", grade: 7, aiLevel: 0, comments: "Excelente trabajo matemático." },
  { assignmentId: 3, studentId: 10, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "Falta entregar." },
  { assignmentId: 3, studentId: 11, workflowStatus: "APPROVED", grade: 9, aiLevel: 1, comments: "Desarrollo claro y muy bien justificado." },
  { assignmentId: 3, studentId: 12, workflowStatus: "WAITING_FOR_CORRECTION", grade: 6, aiLevel: 1, comments: "Falta pulir la argumentación final." },
  { assignmentId: 4, studentId: 13, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "Estudiantes aún no cargaron la solución." },
  { assignmentId: 4, studentId: 14, workflowStatus: "NOT_DICTATED", grade: 0, aiLevel: 0, comments: "El tema aún no fue dictado para este alumno." },
  { assignmentId: 5, studentId: 15, workflowStatus: "WAITING_FOR_CORRECTION", grade: 0, aiLevel: 1, comments: "Entregado a término, falta revisión docente." },
  { assignmentId: 5, studentId: 16, workflowStatus: "REJECTED", grade: 2, aiLevel: 2, comments: "Fraude académico detectado mediante análisis de patrones." },
  { assignmentId: 5, studentId: 17, workflowStatus: "APPROVED", grade: 8, aiLevel: 0, comments: "Muy buena resolución y buena exposición del método." },
  { assignmentId: 6, studentId: 27, workflowStatus: "APPROVED", grade: 9, aiLevel: 0, comments: "Ensayo muy bien documentado y con referencias claras." },
  { assignmentId: 6, studentId: 28, workflowStatus: "WAITING_FOR_CORRECTION", grade: 7, aiLevel: 1, comments: "Buen contenido, falta mayor profundidad en la conclusión." },
  { assignmentId: 7, studentId: 29, workflowStatus: "WAITING_FOR_CORRECTION", grade: 6, aiLevel: 2, comments: "El concepto visual es interesante, pero aún falta pulir la coherencia." },
  { assignmentId: 7, studentId: 30, workflowStatus: "APPROVED", grade: 10, aiLevel: 0, comments: "Proyecto muy sólido y con una propuesta visual muy clara." },
  { assignmentId: 8, studentId: 31, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "Aún no se ha presentado la respuesta final." },
  { assignmentId: 8, studentId: 32, workflowStatus: "APPROVED", grade: 8, aiLevel: 1, comments: "Muy buena comprensión de la consigna y del contexto." },
];

export function insertSeed(client: Database): void {
  const db = drizzle({ client, schema, relations } as any);
  const transaction = client.transaction(() => {
    runSafe(() => {
      db.insert(faculties)
        .values(facultySeeds)
        .onConflictDoUpdate({
          target: faculties.id,
          set: { name: faculties.name },
        })
        .run();
    });

    runSafe(() => {
      db.insert(subjects)
        .values(subjectSeeds)
        .onConflictDoUpdate({
          target: subjects.id,
          set: { facultyId: subjects.facultyId, name: subjects.name },
        })
        .run();
    });

    runSafe(() => {
      db.insert(periods)
        .values(periodSeeds)
        .onConflictDoUpdate({
          target: periods.id,
          set: { year: periods.year, semester: periods.semester },
        })
        .run();
    });

    runSafe(() => {
      db.insert(subjectPeriods)
        .values(subjectPeriodSeeds)
        .onConflictDoUpdate({
          target: subjectPeriods.id,
          set: { subjectId: subjectPeriods.subjectId, periodId: subjectPeriods.periodId },
        })
        .run();
    });

    runSafe(() => {
      db.insert(commissions)
        .values(commissionSeeds)
        .onConflictDoUpdate({
          target: commissions.id,
          set: { subjectId: commissions.subjectId, periodId: commissions.periodId, name: commissions.name },
        })
        .run();
    });

    runSafe(() => {
      db.insert(students)
        .values(studentSeeds)
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
      db.insert(assignments)
        .values(assignmentSeeds)
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
      db.insert(deliveries)
        .values(deliverySeeds)
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
