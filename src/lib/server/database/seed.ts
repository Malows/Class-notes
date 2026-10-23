import { drizzle } from "drizzle-orm/better-sqlite3";
import type { Database } from "better-sqlite3";
import * as schema from "./schema";
import { relations } from "./relations";

import {
  assignments,
  commissions,
  deliveries,
  enrollments,
  faculties,
  periods,
  persons,
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
  { id: 1, name: "Facultad de Ingeniería", slug: "facultad-de-ingenieria" },
  { id: 2, name: "Facultad de Ciencias Exactas", slug: "facultad-de-ciencias-exactas" },
  { id: 3, name: "Facultad de Humanidades y Artes", slug: "facultad-de-humanidades-y-artes" },
];

const subjectSeeds = [
  { id: 1, facultyId: 1, name: "Álgebra Lineal", slug: "algebra-lineal" },
  { id: 2, facultyId: 1, name: "Análisis Matemático I", slug: "analisis-matematico-i" },
  { id: 3, facultyId: 1, name: "Física General I", slug: "fisica-general-i" },
  { id: 4, facultyId: 2, name: "Cálculo Diferencial", slug: "calculo-diferencial" },
  { id: 5, facultyId: 2, name: "Cálculo Integral", slug: "calculo-integral" },
  { id: 6, facultyId: 2, name: "Geometría Analítica", slug: "geometria-analitica" },
  { id: 7, facultyId: 3, name: "Historia de la Ciencia", slug: "historia-de-la-ciencia" },
  { id: 8, facultyId: 3, name: "Comunicación y Diseño", slug: "comunicacion-y-diseno" },
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
  { id: 1, subjectId: 1, periodId: 2, name: "Comisión Mañana", slug: "comision-manana" },
  { id: 2, subjectId: 1, periodId: 2, name: "Comisión Tarde", slug: "comision-tarde" },
  { id: 3, subjectId: 2, periodId: 3, name: "Comisión Única", slug: "comision-unica" },
  { id: 4, subjectId: 3, periodId: 4, name: "Comisión Virtual", slug: "comision-virtual" },
  { id: 5, subjectId: 4, periodId: 1, name: "Comisión A", slug: "comision-a" },
  { id: 6, subjectId: 4, periodId: 1, name: "Comisión B", slug: "comision-b" },
  { id: 7, subjectId: 5, periodId: 2, name: "Comisión 1", slug: "comision-1" },
  { id: 8, subjectId: 5, periodId: 2, name: "Comisión 2", slug: "comision-2" },
  { id: 9, subjectId: 6, periodId: 3, name: "Comisión Noche", slug: "comision-noche" },
  { id: 10, subjectId: 7, periodId: 4, name: "Comisión Taller", slug: "comision-taller" },
  { id: 11, subjectId: 8, periodId: 1, name: "Comisión Diseño", slug: "comision-diseno" },
  { id: 12, subjectId: 8, periodId: 1, name: "Comisión Comunicación", slug: "comision-comunicacion" },
];

const studentSeeds = [
  { id: 1, commissionId: 1, name: "Juan Pérez", legajo: "ING-001" },
  { id: 2, commissionId: 1, name: "María Rodríguez", legajo: "ING-002" },
  { id: 3, commissionId: 1, name: "Carlos Gómez", legajo: "ING-003" },
  { id: 4, commissionId: 1, name: "Ana Martínez", legajo: "ING-004" },
  { id: 5, commissionId: 2, name: "Luis Fernández", legajo: "ING-005" },
  { id: 6, commissionId: 2, name: "Sofía López", legajo: "ING-006" },
  { id: 7, commissionId: 2, name: "Tomás Benítez", legajo: "ING-007" },
  { id: 8, commissionId: 2, name: "Valentina Ruiz", legajo: "ING-008" },
  { id: 9, commissionId: 3, name: "Nicolás Vega", legajo: "MAT-001" },
  { id: 10, commissionId: 3, name: "Paula Sosa", legajo: "MAT-002" },
  { id: 11, commissionId: 3, name: "Mateo Ibarra", legajo: "MAT-003" },
  { id: 12, commissionId: 3, name: "Camila Ortega", legajo: "MAT-004" },
  { id: 13, commissionId: 4, name: "Diego Montalvo", legajo: "FIS-001" },
  { id: 14, commissionId: 4, name: "Lucía Domínguez", legajo: "FIS-002" },
  { id: 15, commissionId: 4, name: "Bruno Álvarez", legajo: "FIS-003" },
  { id: 16, commissionId: 4, name: "Florencia Torres", legajo: "FIS-004" },
  { id: 17, commissionId: 5, name: "Agustín Ríos", legajo: "CAL-001" },
  { id: 18, commissionId: 5, name: "Micaela Prado", legajo: "CAL-002" },
  { id: 19, commissionId: 6, name: "Julián Paredes", legajo: "CAL-003" },
  { id: 20, commissionId: 6, name: "Renata Núñez", legajo: "CAL-004" },
  { id: 21, commissionId: 7, name: "Emilia Castro", legajo: "CAL-005" },
  { id: 22, commissionId: 7, name: "Leandro Acosta", legajo: "CAL-006" },
  { id: 23, commissionId: 8, name: "Noelia Salazar", legajo: "CAL-007" },
  { id: 24, commissionId: 8, name: "Federico Paz", legajo: "CAL-008" },
  { id: 25, commissionId: 9, name: "Milagros Benavides", legajo: "GEO-001" },
  { id: 26, commissionId: 9, name: "Santiago Roldán", legajo: "GEO-002" },
  { id: 27, commissionId: 10, name: "Elena Quiroga", legajo: "HIS-001" },
  { id: 28, commissionId: 10, name: "Tomás Ledesma", legajo: "HIS-002" },
  { id: 29, commissionId: 11, name: "Cecilia Mora", legajo: "DIS-001" },
  { id: 30, commissionId: 11, name: "Pablo Cárdenas", legajo: "DIS-002" },
  { id: 31, commissionId: 12, name: "Natalia Ferrer", legajo: "COM-001" },
  { id: 32, commissionId: 12, name: "Gonzalo Varela", legajo: "COM-002" },
];

const cursadaIdForCommission = (commissionId: number): number => {
  const commission = commissionSeeds.find((entry) => entry.id === commissionId);
  if (!commission) {
    throw new Error(`Seed data references unknown commission ${commissionId}`);
  }

  const cursada = subjectPeriodSeeds.find(
    (entry) => entry.subjectId === commission.subjectId && entry.periodId === commission.periodId,
  );
  if (!cursada) {
    throw new Error(`Seed data has no cursada for commission ${commissionId}`);
  }

  return cursada.id;
};

const personSeeds = studentSeeds.map(({ id, name, legajo }) => ({ id, name, legajo }));

const enrollmentSeeds = studentSeeds.map((student) => ({
  id: student.id,
  personId: student.id,
  subjectPeriodId: cursadaIdForCommission(student.commissionId),
  commissionId: student.commissionId,
}));

const assignmentSeeds = [
  { id: 1, subjectPeriodId: 1, title: "Trabajo Práctico 1", subtitle: "Espacios Vectoriales", workflowStatus: "WAITING_FOR_CORRECTION" },
  { id: 2, subjectPeriodId: 1, title: "Trabajo Práctico 2", subtitle: "Matrices y Determinantes", workflowStatus: "WAITING_FOR_STUDENTS" },
  { id: 3, subjectPeriodId: 2, title: "Trabajo Práctico 1", subtitle: "Límites y Continuidad", workflowStatus: "WAITING_FOR_STUDENTS" },
  { id: 4, subjectPeriodId: 3, title: "Guía de Problemas 1", subtitle: "Cinemática", workflowStatus: "NOT_DICTATED" },
  { id: 5, subjectPeriodId: 5, title: "Trabajo Práctico 2", subtitle: "Integrales y Aplicaciones", workflowStatus: "WAITING_FOR_CORRECTION" },
  { id: 6, subjectPeriodId: 7, title: "Ensayo breve", subtitle: "Historia de la ciencia y el método", workflowStatus: "APPROVED" },
  { id: 7, subjectPeriodId: 8, title: "Proyecto de diseño", subtitle: "Identidad visual para la asignatura", workflowStatus: "WAITING_FOR_CORRECTION" },
  { id: 8, subjectPeriodId: 8, title: "Análisis de caso", subtitle: "Comunicación efectiva en clase", workflowStatus: "WAITING_FOR_STUDENTS" },
];

const deliverySeeds = [
  { assignmentId: 1, enrollmentId: 1, workflowStatus: "APPROVED", grade: 8, aiLevel: 0, comments: "Excelente planteo de los ejercicios de subespacios." },
  { assignmentId: 1, enrollmentId: 2, workflowStatus: "WAITING_FOR_CORRECTION", grade: 6, aiLevel: 1, comments: "Aprobado con lo justo. Prestar atención al uso de IA." },
  { assignmentId: 1, enrollmentId: 3, workflowStatus: "REJECTED", grade: 4, aiLevel: 0, comments: "Faltaron resolver los puntos 3 y 4. Debe rehacer." },
  { assignmentId: 1, enrollmentId: 4, workflowStatus: "APPROVED", grade: 7, aiLevel: 1, comments: "Buen desarrollo, pero con respuestas redactadas sospechosamente por IA." },
  { assignmentId: 1, enrollmentId: 5, workflowStatus: "APPROVED", grade: 10, aiLevel: 0, comments: "Trabajo perfecto y sumamente original." },
  { assignmentId: 1, enrollmentId: 6, workflowStatus: "WAITING_FOR_CORRECTION", grade: 5, aiLevel: 2, comments: "Entregado con varias respuestas genéricas y poco desarrollo." },
  { assignmentId: 1, enrollmentId: 7, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "No entregado aún." },
  { assignmentId: 2, enrollmentId: 1, workflowStatus: "APPROVED", grade: 9, aiLevel: 0, comments: "Perfecto uso de las propiedades del determinante." },
  { assignmentId: 2, enrollmentId: 2, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "No entregado." },
  { assignmentId: 2, enrollmentId: 3, workflowStatus: "NOT_DICTATED", grade: 0, aiLevel: 0, comments: "Tema aún no dictado." },
  { assignmentId: 2, enrollmentId: 4, workflowStatus: "REJECTED", grade: 2, aiLevel: 2, comments: "Certeza absoluta de plagio y generación por IA sin edición." },
  { assignmentId: 2, enrollmentId: 5, workflowStatus: "WAITING_FOR_CORRECTION", grade: 8, aiLevel: 2, comments: "Entregado. Sospecha muy alta de código copiado directamente de ChatGPT." },
  { assignmentId: 2, enrollmentId: 6, workflowStatus: "APPROVED", grade: 8, aiLevel: 1, comments: "Bien resuelto, con ligera ayuda de IA en los comentarios." },
  { assignmentId: 3, enrollmentId: 9, workflowStatus: "APPROVED", grade: 7, aiLevel: 0, comments: "Excelente trabajo matemático." },
  { assignmentId: 3, enrollmentId: 10, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "Falta entregar." },
  { assignmentId: 3, enrollmentId: 11, workflowStatus: "APPROVED", grade: 9, aiLevel: 1, comments: "Desarrollo claro y muy bien justificado." },
  { assignmentId: 3, enrollmentId: 12, workflowStatus: "WAITING_FOR_CORRECTION", grade: 6, aiLevel: 1, comments: "Falta pulir la argumentación final." },
  { assignmentId: 4, enrollmentId: 13, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "Estudiantes aún no cargaron la solución." },
  { assignmentId: 4, enrollmentId: 14, workflowStatus: "NOT_DICTATED", grade: 0, aiLevel: 0, comments: "El tema aún no fue dictado para este alumno." },
  { assignmentId: 5, enrollmentId: 21, workflowStatus: "WAITING_FOR_CORRECTION", grade: 0, aiLevel: 1, comments: "Entregado a término, falta revisión docente." },
  { assignmentId: 5, enrollmentId: 22, workflowStatus: "REJECTED", grade: 2, aiLevel: 2, comments: "Fraude académico detectado mediante análisis de patrones." },
  { assignmentId: 5, enrollmentId: 23, workflowStatus: "APPROVED", grade: 8, aiLevel: 0, comments: "Muy buena resolución y buena exposición del método." },
  { assignmentId: 6, enrollmentId: 27, workflowStatus: "APPROVED", grade: 9, aiLevel: 0, comments: "Ensayo muy bien documentado y con referencias claras." },
  { assignmentId: 6, enrollmentId: 28, workflowStatus: "WAITING_FOR_CORRECTION", grade: 7, aiLevel: 1, comments: "Buen contenido, falta mayor profundidad en la conclusión." },
  { assignmentId: 7, enrollmentId: 29, workflowStatus: "WAITING_FOR_CORRECTION", grade: 6, aiLevel: 2, comments: "El concepto visual es interesante, pero aún falta pulir la coherencia." },
  { assignmentId: 7, enrollmentId: 30, workflowStatus: "APPROVED", grade: 10, aiLevel: 0, comments: "Proyecto muy sólido y con una propuesta visual muy clara." },
  { assignmentId: 8, enrollmentId: 31, workflowStatus: "WAITING_FOR_STUDENTS", grade: 0, aiLevel: 0, comments: "Aún no se ha presentado la respuesta final." },
  { assignmentId: 8, enrollmentId: 32, workflowStatus: "APPROVED", grade: 8, aiLevel: 1, comments: "Muy buena comprensión de la consigna y del contexto." },
];

export function insertSeed(client: Database): void {
  const db = drizzle({ client, schema, relations } as any);
  const transaction = client.transaction(() => {
    runSafe(() => {
      db.insert(faculties)
        .values(facultySeeds)
        .onConflictDoUpdate({
          target: faculties.id,
          set: { name: faculties.name, slug: faculties.slug },
        })
        .run();
    });

    runSafe(() => {
      db.insert(subjects)
        .values(subjectSeeds)
        .onConflictDoUpdate({
          target: subjects.id,
          set: { facultyId: subjects.facultyId, name: subjects.name, slug: subjects.slug },
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
          set: {
            subjectId: commissions.subjectId,
            periodId: commissions.periodId,
            name: commissions.name,
            slug: commissions.slug,
          },
        })
        .run();
    });

    runSafe(() => {
      db.insert(persons)
        .values(personSeeds)
        .onConflictDoUpdate({
          target: persons.id,
          set: {
            name: persons.name,
            legajo: persons.legajo,
          },
        })
        .run();
    });

    runSafe(() => {
      db.insert(enrollments)
        .values(enrollmentSeeds)
        .onConflictDoUpdate({
          target: enrollments.id,
          set: {
            personId: enrollments.personId,
            subjectPeriodId: enrollments.subjectPeriodId,
            commissionId: enrollments.commissionId,
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
            subjectPeriodId: assignments.subjectPeriodId,
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
          target: [deliveries.assignmentId, deliveries.enrollmentId],
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
