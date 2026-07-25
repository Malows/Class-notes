import type { Database } from "better-sqlite3";

export function insertSeed(db: Database): void {
  const transaction = db.transaction(() => {
    const runSafe = (statement: string, params: unknown[]) => {
      try {
        db.prepare(statement).run(...params);
      } catch {
        // Intentionally ignore individual seed failures so bootstrap remains resilient.
      }
    };

    runSafe(
      "INSERT INTO faculties (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name",
      [1, "Facultad de Ingeniería"],
    );
    runSafe(
      "INSERT INTO faculties (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name",
      [2, "Facultad de Ciencias Exactas"],
    );

    runSafe(
      "INSERT INTO subjects (id, faculty_id, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET faculty_id = excluded.faculty_id, name = excluded.name",
      [1, 1, "Álgebra Lineal"],
    );
    runSafe(
      "INSERT INTO subjects (id, faculty_id, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET faculty_id = excluded.faculty_id, name = excluded.name",
      [2, 1, "Análisis Matemático I"],
    );
    runSafe(
      "INSERT INTO subjects (id, faculty_id, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET faculty_id = excluded.faculty_id, name = excluded.name",
      [3, 2, "Física General I"],
    );

    runSafe(
      "INSERT INTO periods (id, year, semester) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET year = excluded.year, semester = excluded.semester",
      [1, 2026, 1],
    );
    runSafe(
      "INSERT INTO periods (id, year, semester) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET year = excluded.year, semester = excluded.semester",
      [2, 2026, 1],
    );
    runSafe(
      "INSERT INTO periods (id, year, semester) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET year = excluded.year, semester = excluded.semester",
      [3, 2026, 1],
    );

    runSafe(
      "INSERT INTO subject_periods (id, subject_id, period_id) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET subject_id = excluded.subject_id, period_id = excluded.period_id",
      [1, 1, 1],
    );
    runSafe(
      "INSERT INTO subject_periods (id, subject_id, period_id) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET subject_id = excluded.subject_id, period_id = excluded.period_id",
      [2, 2, 2],
    );
    runSafe(
      "INSERT INTO subject_periods (id, subject_id, period_id) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET subject_id = excluded.subject_id, period_id = excluded.period_id",
      [3, 3, 3],
    );

    runSafe(
      "INSERT INTO commissions (id, period_id, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET period_id = excluded.period_id, name = excluded.name",
      [1, 1, "Comisión A"],
    );
    runSafe(
      "INSERT INTO commissions (id, period_id, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET period_id = excluded.period_id, name = excluded.name",
      [2, 1, "Comisión B"],
    );
    runSafe(
      "INSERT INTO commissions (id, period_id, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET period_id = excluded.period_id, name = excluded.name",
      [3, 2, "Comisión Única"],
    );

    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [1, 1, "Juan Pérez", "ENG-101"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [2, 1, "María Rodríguez", "ENG-102"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [3, 1, "Carlos Gómez", "ENG-103"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [4, 2, "Ana Martínez", "ENG-201"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [5, 2, "Luis Fernández", "ENG-202"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [6, 3, "Sofía López", "MTH-011"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [7, 2, "Pedro Picapiedra", "ENG-203"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [8, 2, "Vilma Picapiedra", "ENG-204"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [9, 3, "Pablo Mármol", "MTH-012"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [10, 3, "Betty Mármol", "MTH-013"],
    );
    runSafe(
      "INSERT INTO students (id, commission_id, name, external_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET commission_id = excluded.commission_id, name = excluded.name, external_id = excluded.external_id",
      [11, 1, "Hugo Silva", "ENG-104"],
    );

    runSafe(
      "INSERT INTO assignments (id, period_id, title, subtitle, workflow_status) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET period_id = excluded.period_id, title = excluded.title, subtitle = excluded.subtitle, workflow_status = excluded.workflow_status",
      [1, 1, "Trabajo Práctico 1", "Espacios Vectoriales", "WAITING_FOR_CORRECTION"],
    );
    runSafe(
      "INSERT INTO assignments (id, period_id, title, subtitle, workflow_status) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET period_id = excluded.period_id, title = excluded.title, subtitle = excluded.subtitle, workflow_status = excluded.workflow_status",
      [2, 1, "Trabajo Práctico 2", "Matrices y Determinantes", "WAITING_FOR_STUDENTS"],
    );
    runSafe(
      "INSERT INTO assignments (id, period_id, title, subtitle, workflow_status) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET period_id = excluded.period_id, title = excluded.title, subtitle = excluded.subtitle, workflow_status = excluded.workflow_status",
      [3, 2, "Trabajo Práctico 1", "Límites y Continuidad", "WAITING_FOR_STUDENTS"],
    );
    runSafe(
      "INSERT INTO assignments (id, period_id, title, subtitle, workflow_status) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET period_id = excluded.period_id, title = excluded.title, subtitle = excluded.subtitle, workflow_status = excluded.workflow_status",
      [4, 3, "Guía de Problemas 1", "Cinemática", "NOT_DICTATED"],
    );
    runSafe(
      "INSERT INTO assignments (id, period_id, title, subtitle, workflow_status) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET period_id = excluded.period_id, title = excluded.title, subtitle = excluded.subtitle, workflow_status = excluded.workflow_status",
      [5, 2, "Trabajo Práctico 2", "Integrales y Aplicaciones", "WAITING_FOR_CORRECTION"],
    );

    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [1, 1, "APPROVED", 8.5, 0, "Excelente planteo de los ejercicios de subespacios."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [
        1,
        2,
        "WAITING_FOR_CORRECTION",
        6.0,
        1,
        "Aprobado con lo justo. Prestar atención al uso de IA.",
      ],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [1, 3, "REJECTED", 4.0, 0, "Faltaron resolver los puntos 3 y 4. Debe rehacer."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [1, 11, "APPROVED", 7.5, 2, "Resuelto correctamente, pero detectamos código autogenerado."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [2, 1, "APPROVED", 9.0, 0, "Perfecto uso de las propiedades del determinante."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [2, 2, "WAITING_FOR_STUDENTS", 0.0, 0, "No entregado."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [2, 3, "NOT_DICTATED", 0.0, 0, "Tema aún no dictado."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [2, 11, "REJECTED", 2.0, 2, "Plagio descarado con IA, no supo justificar en el coloquio."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [
        1,
        4,
        "APPROVED",
        7.0,
        1,
        "Buen desarrollo, pero con respuestas redactadas sospechosamente por IA.",
      ],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [1, 5, "APPROVED", 10.0, 0, "Trabajo perfecto y sumamente original."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [1, 7, "WAITING_FOR_CORRECTION", 0.0, 0, "Pendiente de corregir."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [
        1,
        8,
        "REJECTED",
        3.0,
        1,
        "Respuestas inconsistentes e indicios claros de copy-paste de IA.",
      ],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [2, 4, "REJECTED", 2.0, 2, "Certeza absoluta de plagio/generación por IA sin edición."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [
        2,
        5,
        "WAITING_FOR_CORRECTION",
        8.0,
        2,
        "Entregado. Sospecha muy alta de código copiado directamente de ChatGPT.",
      ],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [2, 7, "APPROVED", 8.5, 1, "Bien resuelto, con ligera ayuda de IA en los comentarios."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [2, 8, "WAITING_FOR_STUDENTS", 0.0, 0, "No entregado aún."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [3, 6, "APPROVED", 7.5, 2, "Buen desarrollo, pero hay bloques de código sospechosos de IA."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [3, 9, "APPROVED", 9.0, 0, "Excelente trabajo matemático."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [3, 10, "WAITING_FOR_STUDENTS", 0.0, 0, "Falta entregar."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [5, 6, "WAITING_FOR_CORRECTION", 0.0, 1, "Entregado a término."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [5, 9, "REJECTED", 2.0, 2, "Fraude académico detectado mediante análisis de patrones."],
    );
    runSafe(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(assignment_id, student_id) DO UPDATE SET workflow_status = excluded.workflow_status, grade = excluded.grade, ai_level = excluded.ai_level, comments = excluded.comments",
      [5, 10, "NOT_DICTATED", 0.0, 0, "Tema aún no dictado para este alumno."],
    );
  });

  transaction();
}
