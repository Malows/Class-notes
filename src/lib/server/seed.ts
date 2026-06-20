import type { Database } from "better-sqlite3";

export function insertSeed(db: Database): void {
  const transaction = db.transaction(() => {
    // Facultades
    db.prepare(
      "INSERT INTO faculties (id, name) VALUES (1, 'Facultad de Ingeniería'), (2, 'Facultad de Ciencias Exactas')",
    ).run();

    // Materias
    db.prepare(
      "INSERT INTO subjects (id, faculty_id, name) VALUES (1, 1, 'Álgebra Lineal'), (2, 1, 'Análisis Matemático I'), (3, 2, 'Física General I')",
    ).run();

    // Períodos (Ej: Año 2026, 1er Cuatrimestre)
    db.prepare(
      "INSERT INTO periods (id, subject_id, year, semester) VALUES (1, 1, 2026, 1), (2, 2, 2026, 1), (3, 3, 2026, 1)",
    ).run();

    // Comisiones
    db.prepare(
      "INSERT INTO commissions (id, period_id, name) VALUES (1, 1, 'Comisión A'), (2, 1, 'Comisión B'), (3, 2, 'Comisión Única')",
    ).run();

    // Estudiantes
    db.prepare(`
      INSERT INTO students (id, commission_id, name, external_id) VALUES
      (1, 1, 'Juan Pérez', 'ENG-101'),
      (2, 1, 'María Rodríguez', 'ENG-102'),
      (3, 1, 'Carlos Gómez', 'ENG-103'),
      (4, 2, 'Ana Martínez', 'ENG-201'),
      (5, 2, 'Luis Fernández', 'ENG-202'),
      (6, 3, 'Sofía López', 'MTH-011'),
      (7, 2, 'Pedro Picapiedra', 'ENG-203'),
      (8, 2, 'Vilma Picapiedra', 'ENG-204'),
      (9, 3, 'Pablo Mármol', 'MTH-012'),
      (10, 3, 'Betty Mármol', 'MTH-013'),
      (11, 1, 'Hugo Silva', 'ENG-104')
    `).run();

    // Tareas (Assignments)
    db.prepare(`
      INSERT INTO assignments (id, period_id, title, subtitle, workflow_status) VALUES
      (1, 1, 'Trabajo Práctico 1', 'Espacios Vectoriales', 'WAITING_FOR_CORRECTION'),
      (2, 1, 'Trabajo Práctico 2', 'Matrices y Determinantes', 'WAITING_FOR_STUDENTS'),
      (3, 2, 'Trabajo Práctico 1', 'Límites y Continuidad', 'WAITING_FOR_STUDENTS'),
      (4, 3, 'Guía de Problemas 1', 'Cinemática', 'NOT_DICTATED'),
      (5, 2, 'Trabajo Práctico 2', 'Integrales y Aplicaciones', 'WAITING_FOR_CORRECTION')
    `).run();

    // Entregas y Calificaciones (Deliveries)
    db.prepare(`
      INSERT INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES
      -- Comisión 1 (Comisión A) - Periodo 1 (TP1 y TP2)
      (1, 1, 'APPROVED', 8.5, 0, 'Excelente planteo de los ejercicios de subespacios.'),
      (1, 2, 'WAITING_FOR_CORRECTION', 6.0, 1, 'Aprobado con lo justo. Prestar atención al uso de IA.'),
      (1, 3, 'REJECTED', 4.0, 0, 'Faltaron resolver los puntos 3 y 4. Debe rehacer.'),
      (1, 11, 'APPROVED', 7.5, 2, 'Resuelto correctamente, pero detectamos código autogenerado.'),
      (2, 1, 'APPROVED', 9.0, 0, 'Perfecto uso de las propiedades del determinante.'),
      (2, 2, 'WAITING_FOR_STUDENTS', 0.0, 0, 'No entregado.'),
      (2, 3, 'NOT_DICTATED', 0.0, 0, 'Tema aún no dictado.'),
      (2, 11, 'REJECTED', 2.0, 2, 'Plagio descarado con IA, no supo justificar en el coloquio.'),

      -- Comisión 2 (Comisión B) - Periodo 1 (TP1 y TP2)
      (1, 4, 'APPROVED', 7.0, 1, 'Buen desarrollo, pero con respuestas redactadas sospechosamente por IA.'),
      (1, 5, 'APPROVED', 10.0, 0, 'Trabajo perfecto y sumamente original.'),
      (1, 7, 'WAITING_FOR_CORRECTION', 0.0, 0, 'Pendiente de corregir.'),
      (1, 8, 'REJECTED', 3.0, 1, 'Respuestas inconsistentes e indicios claros de copy-paste de IA.'),
      (2, 4, 'REJECTED', 2.0, 2, 'Certeza absoluta de plagio/generación por IA sin edición.'),
      (2, 5, 'WAITING_FOR_CORRECTION', 8.0, 2, 'Entregado. Sospecha muy alta de código copiado directamente de ChatGPT.'),
      (2, 7, 'APPROVED', 8.5, 1, 'Bien resuelto, con ligera ayuda de IA en los comentarios.'),
      (2, 8, 'WAITING_FOR_STUDENTS', 0.0, 0, 'No entregado aún.'),

      -- Comisión 3 (Comisión Única) - Periodo 2 (TP1 y TP2)
      (3, 6, 'APPROVED', 7.5, 2, 'Buen desarrollo, pero hay bloques de código sospechosos de IA.'),
      (3, 9, 'APPROVED', 9.0, 0, 'Excelente trabajo matemático.'),
      (3, 10, 'WAITING_FOR_STUDENTS', 0.0, 0, 'Falta entregar.'),
      (5, 6, 'WAITING_FOR_CORRECTION', 0.0, 1, 'Entregado a término.'),
      (5, 9, 'REJECTED', 2.0, 2, 'Fraude académico detectado mediante análisis de patrones.'),
      (5, 10, 'NOT_DICTATED', 0.0, 0, 'Tema aún no dictado para este alumno.')
    `).run();
  });

  transaction();
}
