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
      (6, 3, 'Sofía López', 'MTH-011')
    `).run();

    // Tareas (Assignments)
    db.prepare(`
      INSERT INTO assignments (id, period_id, title) VALUES 
      (1, 1, 'Trabajo Práctico 1: Espacios Vectoriales'),
      (2, 1, 'Trabajo Práctico 2: Matrices y Determinantes'),
      (3, 2, 'Trabajo Práctico 1: Límites y Continuidad'),
      (4, 3, 'Guía de Problemas 1: Cinemática')
    `).run();

    // Entregas y Calificaciones (Deliveries)
    db.prepare(`
      INSERT INTO deliveries (assignment_id, student_id, is_delivered, is_approved, grade, ai_level, comments) VALUES 
      (1, 1, 1, 1, 8.5, 0, 'Excelente planteo de los ejercicios de subespacios.'),
      (1, 2, 1, 1, 6.0, 1, 'Aprobado con lo justo. Prestar atención al uso de IA.'),
      (1, 3, 1, 0, 4.0, 0, 'Faltaron resolver los puntos 3 y 4. Debe rehacer.'),
      (2, 1, 1, 1, 9.0, 0, 'Perfecto uso de las propiedades del determinante.'),
      (2, 2, 0, 0, 0.0, 0, 'No entregado.'),
      (3, 6, 1, 1, 7.5, 2, 'Buen desarrollo, pero hay bloques de código sospechosos de IA.')
    `).run();
  });

  transaction();
}
