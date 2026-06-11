## 1. Infraestructura Base y UI Genérica

- [x] 1.1 Corregir imports de `$lib/components/pure` a `$lib/components/common` en todo el proyecto.
- [x] 1.2 Crear componente `src/lib/components/common/ResponsiveTable.svelte` usando Svelte 5 snippets.
- [x] 1.3 Implementar utilidades de contexto base en `src/lib/stores/context-helper.ts`.

## 2. Migración de Stores a Svelte 5 (Clases + Runes)

- [x] 2.1 Refactorizar `faculties.store.ts` a `faculties.svelte.ts`.
- [x] 2.2 Refactorizar `subjects.store.ts` a `subjects.svelte.ts`.
- [x] 2.3 Refactorizar `periods.store.ts` a `periods.svelte.ts`.
- [x] 2.4 Refactorizar `commissions.store.ts` a `commissions.svelte.ts`.
- [x] 2.5 Refactorizar `assignments.store.ts` a `assignments.svelte.ts`.
- [x] 2.6 Refactorizar `students.store.ts` a `students.svelte.ts`.
- [x] 2.7 Refactorizar `nav.store.ts` a `nav.svelte.ts` integrando `$derived` global.

## 3. Implementación de Inyección de Dependencias (DI)

- [x] 3.1 Actualizar `src/routes/+layout.svelte` para inicializar y proveer todos los store contexts.
- [x] 3.2 Actualizar componentes de página para consumir stores vía `getStoreContext()` en lugar de imports directos.

## 4. Refactorización de Componentes de UI

- [x] 4.1 Migrar `AssignmentTable.svelte` a `ResponsiveTable`.
- [x] 4.2 Migrar `CommissionTable.svelte` a `ResponsiveTable`.
- [x] 4.3 Migrar `FacultyTable.svelte` a `ResponsiveTable`.
- [x] 4.4 Migrar `PeriodTable.svelte` a `ResponsiveTable`.
- [x] 4.5 Migrar `StudentTable.svelte` a `ResponsiveTable`.
- [x] 4.6 Refactorizar `DashboardStats.svelte` para usar sub-componentes atómicos.

## 5. Verificación y Limpieza

- [x] 5.1 Actualizar tests de Vitest para soportar la nueva estructura de clases y DI.
- [x] 5.2 Eliminar archivos `.ts` de stores antiguos y código redundante.
- [x] 5.3 Verificar que no queden usos de `any` en los servicios de datos.
