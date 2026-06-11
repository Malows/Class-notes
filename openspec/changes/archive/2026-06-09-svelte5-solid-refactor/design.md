## Context

El sistema actual usa stores de Svelte 4 (`writable`) definidos como singletons. Esto genera acoplamiento fuerte con los servicios y dificulta el testing unitario de componentes. Además, el UI sufre de redundancia masiva en la representación de datos (tablas vs cards).

## Goals / Non-Goals

**Goals:**

- Implementar patrón de "Contexto de Estado" en Svelte 5.
- Desacoplar Stores de Servicios mediante Inyección de Dependencias.
- Estandarizar la UI responsiva con un componente `ResponsiveTable`.
- Tipado estricto en todos los servicios de datos.

**Non-Goals:**

- Cambiar la base de datos o el backend.
- Cambiar el framework de estilos (PaperCSS se mantiene).
- Refactorizar lógica de negocio compleja fuera de los stores/servicios.

## Decisions

### 1. Stores como Clases con Runes

- **Decisión**: Usar clases con campos `$state` y métodos asíncronos para mutaciones.
- **Razón**: Es el estándar de Svelte 5. Mejora la legibilidad y permite encapsular lógica privada fácilmente.
- **Alternativa**: Seguir con `writable`. Descartada por ser el patrón "legacy".

### 2. Dependency Injection vía Context API

- **Decisión**: Crear funciones `setStoreContext` y `getStoreContext` para cada store. Llamar a `setStoreContext` en `+layout.svelte`.
- **Razón**: Evita el uso de singletons globales, facilitando mocks en Vitest y alineándose con SOLID (Inversión de Dependencia).
- **Alternativa**: Importar instancias de store directamente. Descartada por acoplamiento.

### 3. Componente `ResponsiveTable` con Snippets

- **Decisión**: Usar `@render` y `{#snippet}` de Svelte 5 para definir cabeceras y filas.
- **Razón**: Elimina la duplicación de código en `*Table.svelte`. Permite definir la estructura visual una sola vez.
- **Alternativa**: Seguir con el patrón actual de copiar/pegar tablas y divs móviles. Descartada por mantenimiento.

## Risks / Trade-offs

- **[Risk]** Curva de aprendizaje de Svelte 5 → **Mitigation**: Seguir la documentación de Context7 estrictamente.
- **[Risk]** Romper rutas existentes durante el refactor → **Mitigation**: Refactorizar un módulo a la vez (ej. Faculties) y verificar con tests existentes.
- **[Trade-off]** Más archivos iniciales (Context wrappers) → **Benefit**: Código mucho más modular y fácil de testear.
