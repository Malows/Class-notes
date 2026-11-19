# Class Notes — descripción de la aplicación

Documento de referencia para explicar la app y para trabajar sobre la interfaz.
Describe **qué es**, **cómo está organizada** y **qué elementos tiene cada vista**.
No reemplaza a `AGENTS.md` (convenciones para agentes) ni a `openspec/specs/` (comportamiento acordado).

---

## 1. Para qué es

Class Notes es una herramienta **personal del docente** para llevar el día a día de sus
materias: quiénes cursan, qué trabajos prácticos se dictaron, quién entregó, qué nota sacó
y quién vino a clase.

Reemplaza el combo planilla de cálculo + cuaderno: todo vive en una sola jerarquía
navegable y la información de una comisión se lee en una grilla.

**Es para una persona que dicta una o varias materias**, en una o varias comisiones, a lo
largo de varios cuatrimestres.

**No es** un sistema institucional de gestión académica:

- no hay inscripción oficial ni legajo validado contra un padrón (el legajo es texto libre);
- los alumnos no se loguean: no hay portal del estudiante;
- no hay correlatividades, planes de estudio, ni historias académicas formales;
- no hay fechas de clase ni horarios: un TP es un encuentro, no un cronograma.

---

## 2. El modelo mental

La app se entiende con dos ejes que se cruzan: la **estructura académica** y las **personas**.

```
FACULTAD
  └── MATERIA
        └── CURSADA  = MATERIA x PERÍODO (2025 · 1º)      <- el "cuatrimestre de la materia"
              ├── COMISIÓN "Mañana"   ──┐
              ├── COMISIÓN "Tarde"    ──┤
              ├── TRABAJO PRÁCTICO 1  ──┤
              ├── TRABAJO PRÁCTICO 2  ──┤
              └── INSCRIPCIONES       ──┘

PERSONA (nombre + legajo, una sola vez)
  └── INSCRIPCIÓN = "esta persona cursa esta materia en este período"
        └── comisión asignada (opcional)
```

Consecuencias que se ven en toda la UI:

- **Una persona puede cursar varias materias** y volver en otro cuatrimestre: el registro
  de personas es global, con historial.
- **La inscripción es la unidad de trabajo**, no la persona: la nómina, la asistencia y las
  entregas cuelgan de inscripciones.
- **Una inscripción puede no tener comisión** ("sin comisión"): está cursando pero todavía
  no se le asignó aula. Ese es el estado de *pendientes*.
- **El período es global**: `2025 · 1º` es uno solo y lo comparten todas las materias. Por
  eso todo lo que dice "materia en un período" se scopea por la **cursada**, nunca por el
  período solo.
- **Los TPs son de la cursada**, no de la comisión: las dos comisiones ven los mismos TPs.

---

## 3. Marco de la interfaz

Todas las páginas comparten el mismo esqueleto:

```
+----------------------------------------------------------------------+
| NAVBAR   Clase Notas | Inicio > Álgebra Lineal > 2025 > Comisión...  |
|                                   🇦🇷  ☀️/🌙       (bottom nav mobile)|
+---------------+------------------------------------------------------+
| SIDEBAR       |                                                      |
|  Inicio       |   CONTENIDO DE LA PÁGINA                             |
|  Facultades   |   (título, acciones, tabla / grilla / formulario)     |
|  Periodos     |                                                      |
|  Alumnos      |                                                      |
|  ─ Materias   |                                                      |
|  ─ Periodos   |                                                      |
|  ─ Comisiones |                                                      |
+---------------+------------------------------------------------------+
| FOOTER   Gestión Docente - Hecho con ❤️                               |
+----------------------------------------------------------------------+
```

- **Navbar**: breadcrumbs derivados de la URL; selector de idioma (ES/EN) y de tema
  (claro/oscuro). En mobile es un header fijo y la navegación principal vive en una barra
  inferior de cuatro destinos.
- **Sidebar**: rail fijo de escritorio con los accesos globales (Inicio, Facultades, Periodos,
  **Alumnos**) y, cuando estás dentro de una jerarquía, tres secciones de contexto — Materias,
  Periodos, Comisiones — que resaltan la activa y permiten saltar lateralmente.
- **Estética**: Tailwind CSS 4 + daisyUI 5 sobre los tokens "Academic Notebook" (papel cálido,
  tinta, Newsreader/Inter, hairlines de 1 px, densidad de 40 px).
- **Mobile**: las tablas se convierten en tarjetas (`ResponsiveTable`); las grillas hacen
  scroll horizontal; el modo de toma de asistencia está pensado para el teléfono.
- **Estados comunes**: `Cargando…`, estado vacío con CTA, mensaje de "no existe", y toasts
  de éxito/error en la esquina.

---

## 4. Vistas

### 4.1 Panel principal — `/`

Punto de entrada. Dos tarjetas sobre el saludo *"Bienvenido"*:

```
📋 Pendientes de Corrección                    📊 Resumen Académico
  Álgebra Lineal                    (12)         Total Alumnos        32
    Comisión Mañana       8 pendientes  [Ir]     Materias              8
    Comisión Tarde        4 pendientes  [Ir]     Tasa Aprobación      63%
  Física General I                   (3)        Entregas            128
    ...
```

- **Pendientes de Corrección**: agrupado por materia, con el total por materia y una fila
  por comisión. Cada fila muestra el período de la comisión (`2025 · 1º`), el conteo y `[Ir]`
  a su resumen. Vacío: *"No hay pendientes de corrección en el período vigente."*
  (el mensaje menciona el período vigente, pero la consulta no filtra por período: ver §9).
- **Resumen Académico**: cuatro métricas globales (alumnos, materias, tasa de aprobación,
  entregas).

---

### 4.2 Facultades — `/faculties`

Lista raíz de la jerarquía.

```
Gestión de Facultades                              [+ Agregar]
+----+-------------------------------+-----------------------------+
| ID | Nombre                        | Acciones                    |
+----+-------------------------------+-----------------------------+
|  1 | Facultad de Ingeniería        | [Ver materias] [Editar][Borrar] |
|  2 | Facultad de Ciencias Exactas  | [Ver materias] [Editar][Borrar] |
```

- **Ver materias** → `/faculties/{slug}/subjects`.
- Modal `FacultyModal`: un campo, *Nombre de la Facultad*.
- Confirmación de borrado por nombre.

---

### 4.3 Materias de una facultad — `/faculties/{faculty}/subjects`

```
Gestión de Materias                                [+ Agregar]
+-------------------------------+----------------+-------------------------------+
| Nombre                        | Facultad       | Acciones                      |
+-------------------------------+----------------+-------------------------------+
| Álgebra Lineal                | Ing.           | [Ver periodos] [Editar][Borrar]|
```

- **Ver periodos** → `/faculties/{faculty}/subjects/{subject}/periods`.
- Si la facultad del slug no existe: estado *"La facultad seleccionada no existe…"*.
- Modal `SubjectModal`: *Nombre de la Materia*.

---

### 4.4 Períodos de una materia — `/faculties/{faculty}/subjects/{subject}/periods`

El "tablero" de una materia: cada fila es una cursada.

```
Períodos                                           [+ Agregar]
+------+-----------+--------------------------------------------------------------+
| Año  | Cuatrim.  | Acciones                                                     |
+------+-----------+--------------------------------------------------------------+
| 2025 | 1º        | [Resumen] [Comisiones] [Definir TPs] [Materias] [Editar][Borrar] |
| 2024 | 2º        | [Resumen] [Comisiones] [Definir TPs] [Materias] [Editar][Borrar] |
```

Cada acción abre una vista distinta de esa cursada:

- **Resumen** → grilla alumnos × TPs de toda la cursada (4.15).
- **Comisiones** → comisiones del período (4.8).
- **Definir TPs** → trabajos prácticos (4.7).
- **Materias** → qué materias están asociadas a ese período (4.6).
- Modal `PeriodModal`: *Año* (número) y *Cuatrimestre* (1º/2º). Si el par año+cuatrimestre
  ya existe, la API responde 409 y se muestra el error.

---

### 4.5 Períodos globales — `/periods`

La vista "archivo": todos los períodos del sistema, sin pasar por una materia.

- Tabla: **Año**, **Cuatrimestre**, acciones `[Ver materias] [Editar] [Borrar]`.
- **Ver materias** → `/periods/{year}/{semester}/subjects`.
- `[+ Agregar]` crea un período nuevo.

---

### 4.6 Materias asociadas a un período — `/periods/{year}/{semester}/subjects`

Sirve para decir qué materias se dictan en ese cuatrimestre.

```
Período: 2025 / 1                        [« Volver a periodos]
Materias asociadas
+----------------------------+   +----------------------------+
| Facultad de Ingeniería     |   | Facultad de Ciencias Exactas|
|  [x] Álgebra Lineal        |   |  [ ] Cálculo Diferencial    |
|  [ ] Análisis Matemático I |   |  [x] Geometría Analítica    |
+----------------------------+   +----------------------------+
                                              [Guardar cambios]
```

- Checkboxes agrupados por facultad; guardado único que sincroniza el vínculo
  materia↔período. Toasts de éxito/error.

---

### 4.7 Definir Trabajos Prácticos — `.../periods/{year}/{semester}/assignments`

Los TPs de la cursada (compartidos por todas sus comisiones).

```
Definir Trabajos Prácticos                         [+ Agregar]
[« Volver a periodos]              [Copiar TPs de Período Anterior]

⚠ Al crear o copiar trabajos prácticos, se generarán automáticamente las
  planillas de entregas para todos los estudiantes inscriptos en este período.

+---------------------------+----------------------------+------------------------+--------------------------------+
| Título                    | Subtítulo                  | Estado                 | Acciones                       |
+---------------------------+----------------------------+------------------------+--------------------------------+
| Trabajo Práctico 1        | Espacios Vectoriales       | Esperando corrección   | [Avanzar Estado] [Editar][Borrar]|
```

- **Estado** del TP (workflow): *No dictado* → *Esperando entregas* → *Esperando
  corrección*. *Avanzar Estado* pide confirmación y **arrastra a todas las entregas** del TP.
- **Copiar TPs de Período Anterior**: duplica las definiciones desde la cursada anterior de
  la misma materia y genera las planillas de entrega.
- Modal `AssignmentModal`: *Título*, *Subtítulo / Tema*, *Estado inicial del flujo*.

---

### 4.8 Comisiones de la cursada — `.../periods/{year}/{semester}/commissions`

```
Comisiones del Periodo                             [+ Agregar]
[« Volver a periodos]   [Asistencia de la cursada]

+------------------+----------+---------------------------------------------------------+
| Nombre           | Alumnos  | Acciones                                                |
+------------------+----------+---------------------------------------------------------+
| Comisión Mañana  |    4     | [Alumnos] [Resumen] [Asistencia] [Editar] [Borrar]       |
| Comisión Tarde   |    4     | [Alumnos] [Resumen] [Asistencia] [Editar] [Borrar]       |
+------------------+----------+---------------------------------------------------------+

Inscriptos sin comisión (2)
2 sin comisión
  Emilia Castro · CAL-005      [Comisión ▾] [Asignar]
  Leandro Acosta · CAL-006     [Comisión ▾] [Asignar]
```

- `Alumnos` → nómina (4.9) · `Resumen` → grilla de entregas (4.10) · `Asistencia` → (4.12).
- **Inscriptos sin comisión** aparece sólo si hay pendientes: cada fila trae un `<select>`
  con las comisiones de la cursada y el botón **Asignar**.
- **Asistencia de la cursada** es el acceso a la grilla global (4.13).

---

### 4.9 Nómina de la comisión — `.../commissions/{commission}/students`

```
Inscripciones                                      [+ Agregar]
[« Volver a comisiones]
+------------------+-----------+---------------+
| Nombre           | Legajo    | Acciones      |
+------------------+-----------+---------------+
| Ana Martínez     | ING-004   | [Borrar]      |
| Carlos Gómez     | ING-003   | [Borrar]      |
```

- El **nombre es un link** al registro de la persona (`/persons/{id}`).
- **Borrar** quita la *inscripción* de esa comisión (con confirmación que aclara que el
  alumno sigue en el registro).
- **No se edita al alumno acá**: nombre y legajo se editan desde el registro (4.16).
- El alta (`EnrollmentModal`) tiene dos solapas:
  - *Un solo alumno*: buscador por nombre o legajo que **reutiliza** personas existentes
    (muestra "ya existe y se lo va a inscribir"), campo legajo, y crea si no hay match.
  - *Carga de alumnos*: pegar una lista (un nombre por línea).
  - Al guardar informa: `"3 inscriptos · 2 reutilizados"`.

---

### 4.10 Resumen de comisión — `.../commissions/{commission}/overview`

La grilla de entregas: alumnos × TPs, con semáforo.

```
Resumen de Comisión
[« Volver a comisiones]
+--------------+------+------+------+------+
| Alumno       | TP1  | TP2  | TP3  | ...  |
+--------------+------+------+------+------+
| Ana Martínez |  ✅  |  ⏳  |  -   |      |
| Carlos Gómez |  ❌  |  -   |  -   |      |
+--------------+------+------+------+------+
[Leyenda ▾]  V: Aprobado · R: Desaprobado · -: Pendiente · ⚠️ IA sospechosa · 🤖 IA certeza
```

- Cada celda es un link a la corrección de ese alumno y TP.
- Íconos: ✅ aprobado · ❌ desaprobado · ⏳ entregado sin corregir · `-` sin entregar ·
  ⚠️/🤖 nivel de IA (el badge de IA **tiene prioridad** sobre el ícono de estado).
- Estados vacíos: sin TPs → tarjeta con CTA *Definir Trabajos Prácticos*; sin alumnos →
  CTA *Gestionar Alumnos* (y *Gestionar Comisiones* si la comisión no existe).

---

### 4.11 Corregir — `.../commissions/{commission}/correct?assignment_id=&enrollment_id=&mode=`

Corrección secuencial, un alumno por pantalla.

```
Corregir Trabajo Práctico 1
Alumno: Ana Martínez (1 de 4)

+--------------------------------------------------+
| [x] ¿Entregó el trabajo?                         |
| ( ) Aprobado      (x) No Aprobado                |
| Nota: [ 8 ]                                      |
| Uso de IA: [ 0 - Ninguno ▾ ]                     |
| Comentarios: [                                 ] |
|                                    [ GUARDAR ]   |
| [« Anterior]                      [Saltar »]     |
+--------------------------------------------------+
```

- `mode=single` (al venir de una celda): al guardar vuelve al resumen. En modo recorrido,
  avanza al siguiente alumno.
- **Saltar** pasa al siguiente sin guardar; **Anterior** retrocede.
- El formulario (`DeliveryForm`) también se usa en el modal de corrección desde otras vistas.

---

### 4.12 Asistencia de la comisión — `.../commissions/{commission}/attendance`

```
Asistencia
[« Volver a la comisión]
+--------------+-------------------+-------------------+----------+
| Alumno       | Trabajo Práct. 1  | Trabajo Práct. 2  | Tomadas  |
+--------------+-------------------+-------------------+----------+
| Ana Martínez |        ✅         |        –          |  1 / 1   |
| Carlos Gómez |        ❌         |        –          |  0 / 1   |
| Juan Pérez   |        –          |        –          |  0 / 0   |
+--------------+-------------------+-------------------+----------+
|              |      2 / 3        |    Sin tomar      |          |
```

- Celdas tri-estado: `–` sin tomar · `✅` presente · `❌` ausente. Un click **cicla**
  sin tomar → presente → ausente (edición rápida en escritorio).
- **Tomadas** por fila = presentes / tomadas (no cuenta los TPs sin tomar).
- Fila inferior: presentes / tomadas por columna; una columna sin registros dice
  *"Sin tomar"*, no `0`.
- El **título de cada TP es un link** al modo de toma para ese TP.
- Vacíos: *"Esta comisión todavía no tiene alumnos."* / *"Esta cursada todavía no tiene
  trabajos prácticos."*

---

### 4.13 Asistencia de la cursada — `.../periods/{year}/{semester}/attendance`

La misma grilla, pero con **todas las inscripciones de la materia en ese período**.

```
Asistencia de la cursada
[« Volver a la asistencia]
+------------------------+-------------------+-------------------+
| Alumno                 | Trabajo Práct. 1  | Trabajo Práct. 2  |
+------------------------+-------------------+-------------------+
| Ana Martínez           |        ✅         |        –          |
|   Comisión Mañana      |                   |                   |
| Luis Fernández         |        –          |        –          |
|   Comisión Tarde       |                   |                   |
| Emilia Castro          |        –          |        –          |
|   Sin comisión         |                   |                   |
```

- Cada fila muestra su comisión (o "Sin comisión"). Es la vista "global" de la materia.
- También editable por celda. No ofrece modo de toma: eso siempre es por comisión.

---

### 4.14 Tomar asistencia — `.../commissions/{commission}/attendance/take?assignment_id=`

Flujo pensado para el teléfono, de a un alumno.

```
Tomar asistencia · Trabajo Práctico 1
┌────────────────────────────────────────────┐
│                 1 de 4                     │
│                                            │
│             Ana Martínez                   │
│        ING-004 · Comisión Mañana           │
│               Sin tomar                    │
│   Deslizá a la derecha para presente,      │
│   a la izquierda para ausente,             │
│   arriba para saltar                       │
└────────────────────────────────────────────┘
     [Ausente]   [Saltar]   [Presente]   [Deshacer]

     [Marcar todos presentes]  [Finalizar]  [Volver a la grilla]
```

- **Gestos**: derecha = presente, izquierda = ausente, arriba = saltar (deja sin marcar).
  La tarjeta se tiñe y se desplaza mientras arrastrás, y vuelve si no pasa el umbral.
- **Teclado**: `→` presente, `←` ausente, `↑` saltar; `Ctrl/⌘+Z` o `Backspace` deshace.
- **Deshacer** restaura el valor anterior (o lo deja sin tomar) y vuelve a ese alumno.
- **Marcar todos presentes** aplica a toda la nómina en un solo envío, para después ajustar.
- **Finalizar** corta el recorrido y muestra el reporte:

```
Asistencia terminada
  2 presentes
  1 ausentes
  1 sin tomar
  [Tomar asistencia]  [Volver a la grilla]
```

---

### 4.15 Resumen de la cursada — `.../periods/{year}/{semester}/overview`

Grilla de entregas a nivel materia: **todos los alumnos de todas las comisiones** × los TPs.

- Misma semántica que el resumen de comisión (semáforo + leyenda), con el alumno repetido
  por comisión si corresponde.
- Es la vista para "cómo va la materia", no para corregir.
- *Nota de UI*: las celdas enlazan con `commissions/{commissionSlug}` vacío, así que hoy esos
  links no resuelven a una comisión concreta (ver §9).

---

### 4.16 Registro de alumnos — `/persons`

El padrón personal: todas las personas, cursen o no.

```
Alumnos                                            [+ Agregar]
Buscar alumnos
[Nombre o legajo........................]

Mostrando 32 de 32
+--------------------+----------+-----------+---------------------------+
| Nombre             | Legajo   | Cursadas  | Última cursada            |
+--------------------+----------+-----------+---------------------------+
| Ana Martínez       | ING-004  |     1     | Álgebra Lineal · 2025-1   |
| Beto Gómez         | —        |     0     | Sin cursadas              |
```

- Buscador por nombre o legajo (filtra al escribir), paginado con **Cargar más** y
  *"Mostrando N de M"*.
- **Cursadas** cuenta inscripciones activas; **Última cursada** muestra materia y período.
- Personas con `0 cursadas` se listan igual, marcadas **"Sin cursadas"** (a propósito).
- `[+ Agregar]` crea una persona **sin inscribirla**: queda con 0 cursadas hasta que se la
  agregue desde una comisión.

---

### 4.17 Detalle de alumno — `/persons/{id}`

```
[« Volver a alumnos]
Beto Gómez
Legajo: ING-001
[Editar] [Borrar]

Cursadas
  Álgebra Lineal · 2025 - 1º    Comisión Mañana   <- link al resumen de la comisión
  Análisis Matemático I · 2025 - 2º   Sin comisión
```

- **Editar** (`PersonModal`): nombre y legajo; un legajo tomado responde 409 y el error se
  muestra dentro del modal.
- **Borrar**: confirmación que avisa que sale de **todas** sus cursadas y que el legajo
  vuelve a estar disponible. Es un borrado lógico (se puede recrear el legajo).
- Sin cursadas: *"Este alumno todavía no tiene cursadas."*
- **No hay acción para agregar una cursada desde acá** (ver §9).

---

## 5. Modales y diálogos

Todos comparten `DialogBase` (diálogo nativo, título, cierre por ✕/Escape/click afuera,
footer con acciones).

| Modal | Campos | Se abre desde |
|---|---|---|
| `FacultyModal` | Nombre | Facultades |
| `SubjectModal` | Nombre | Materias |
| `PeriodModal` | Año, Cuatrimestre | Períodos (global y de materia) |
| `CommissionModal` | Nombre | Comisiones |
| `EnrollmentModal` | solapas *Un solo alumno* (buscador + legajo) / *Carga de alumnos* (lista) | Nómina |
| `PersonModal` | Nombre, Legajo | Registro de alumnos |
| `AssignmentModal` | Título, Subtítulo, Estado inicial | Definir TPs |
| `ConfirmDialog` | Título, mensaje, `Confirmar`/`Cancelar` | Toda acción destructiva |

`DeliveryForm` (formulario de entrega/corrección): **¿Entregó el trabajo?** (check),
**Aprobado / No Aprobado** (radio), **Nota** (numérico), **Uso de IA** (0 ninguno /
1 sospecha / 2 certeza), **Comentarios** (texto).

---

## 6. Flujos típicos

**Alta de alumnos en una comisión**
`Comisiones → [Alumnos] → [+ Agregar]` → buscar persona existente (se reutiliza) o pegar
una lista → `Crear` → toast *"N inscriptos · M reutilizados"*.

**Alta de una persona sin cursada**
`Alumnos → [+ Agregar]` → nombre y legajo → aparece con *Sin cursadas*; luego se la
inscribe desde la comisión (el buscador la encuentra por legajo).

**Preparar una materia nueva**
`Facultades → [Ver materias] → [+ Agregar]` → `[Ver periodos] → [+ Agregar]` (año y
cuatrimestre) → `[Materias]` para asociar materias al período → `[Comisiones] → [+ Agregar]`
→ `[Alumnos] → [+ Agregar]` → `[Definir TPs] → [+ Agregar]`.

**Copiar los TPs del cuatrimestre anterior**
`Definir TPs → [Copiar TPs de Período Anterior]` → confirma → duplica definiciones y genera
las planillas de entrega de los inscriptos actuales.

**Corregir un TP**
`Resumen` → click en la celda del alumno → formulario → `GUARDAR` (vuelve a la grilla).
O `Resumen` → celda → recorrido secuencial con *Saltar* / *Anterior*.

**Tomar asistencia**
`Comisiones → [Asistencia]` → click en el título del TP → swipes o botones → `Finalizar` →
reporte → `Volver a la grilla`.

**Repartir los que no tienen comisión**
`Comisiones` → sección *Inscriptos sin comisión* → elegir comisión → `Asignar`.

---

## 7. Piezas de UI reutilizables

| Componente | Para qué |
|---|---|
| `Button` | botón o link (`href`/`onclick`, `withHover`, `class`), con las variantes editoriales |
| `PageWithAdd` / `CommonPage` | layout de página: título, lead, acción "+ Agregar", contenido |
| `Card`, `Badge`, `StatItem` | contenedores y métricas |
| `ResponsiveTable` | tabla en escritorio, tarjetas en mobile (renderiza **ambas** en el DOM) |
| `DialogBase`, `ConfirmDialog`, `ErrorSpan` | diálogos y errores de formulario |
| `GuardWrapper` | valida que la entidad del slug exista antes de mostrar la vista |
| `OverviewGrid` + `OverviewHeader/Row/Cell/Legend/Empty*` | grilla de entregas con semáforo |
| `AttendanceGrid` + `AttendanceCell` | grilla de asistencia (tri-estado) |
| `TakeAttendanceCard` | tarjeta con gestos del modo de toma |
| `DeliveryForm` | formulario de entrega/corrección |
| `Toast` / `ToastContainer` | notificaciones |
| `Sidebar` + `SidebarContextSection/Item` | navegación global y de contexto |

Colores del semáforo: verde aprobado, rojo desaprobado, amarillo/gris pendiente; el nivel de
IA se superpone con ⚠️/🤖.

---

## 8. Glosario (UI ↔ código)

| En la UI | En el código | Notas |
|---|---|---|
| Alumno / Persona | `Person` (`persons`) | nombre + legajo; existe sin cursar |
| Legajo | `legajo` | opcional, único entre los no borrados |
| Inscripción / Cursada (fila) | `Enrollment` (`enrollments`) | persona × materia-período; comisión opcional |
| Materia | `Subject` | |
| Período / Cuatrimestre | `Period` | global: `2025 · 1º` |
| Cursada (materia × período) | `subject_period` / `SubjectPeriod` | la mayoría de las vistas cuelgan de acá |
| Comisión | `Commission` | aula/grupo dentro de una cursada |
| TP / Trabajo Práctico | `Assignment` | de la cursada, compartido por sus comisiones |
| Entrega | `Delivery` | por alumno y TP; estado, nota, IA, comentarios |
| Asistencia | `Attendance` | por alumno y TP; presente/ausente/sin tomar |
| Estado del TP | `AssignmentWorkflowStatus` | No dictado → Esperando entregas → Esperando corrección |
| Estado de la entrega | `DeliveryWorkflowStatus` | Not dictated · Waiting for students · Waiting for correction · Approved · Rejected |
| Nivel de IA | `ai_level` | 0/1/2 |

---

## 9. Huecos y deudas visibles en la UI

Sirven como mapa de trabajo futuro; ninguno está implementado.

1. **No se puede agregar una cursada desde el alumno.** Inscribir siempre arranca en la
   comisión (`[Alumnos] → [+ Agregar]`).
2. **No hay "restaurar" personas borradas.** El borrado es lógico, pero no hay vista de
   papelera ni undo.
3. **No hay total de inscriptos por cursada en pantalla**: se ve 4 + 4 por comisión, no "8
   en Álgebra 2025-1" (el endpoint de roster ya devuelve la lista completa).
4. **Los links de celda del Resumen de cursada** (`.../periods/{y}/{sem}/overview`) no
   resuelven a una comisión porque se arma con `commissionSlug` vacío.
5. **No hay búsqueda global** (solo en Alumnos y en el alta de inscripción).
6. **No se puede reasignar la comisión de un alumno desde la nómina**: sólo los pendientes
   tienen el selector.
7. **Sin historial de asistencia por fecha**: un TP guarda un solo estado (la fecha de la
   última marca), no una clase por fecha.
8. **`CorrectionModal` está sin uso**: existe el componente pero nadie lo monta; la
   corrección real vive en la página `correct` con `DeliveryForm`.
9. **Crear un período desde `/periods` lo asocia siempre a la materia 1**: la página llama
   `periodsStore.create(1, year, semester)`, así que el vínculo se crea contra esa materia.
10. **El vacío de "Pendientes de Corrección"** dice "período vigente" pero la consulta no
    filtra por período.
11. **Invitados de otra comisión**: fuera de alcance por ahora (asistencia acotada a la
    nómina de la comisión).
12. **Sin fechas ni horarios** de cursada: no hay calendario ni agenda.
