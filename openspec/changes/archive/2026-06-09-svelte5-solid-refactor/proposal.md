## Why

El proyecto utiliza un sistema de gestión de estado híbrido con Svelte 4 (`writable`) que no aprovecha las ventajas de rendimiento y ergonomía de Svelte 5 Runes (`$state`, `$derived`). Además, existe una alta duplicación de código en los componentes de tabla y una violación del principio de Inversión de Dependencias (SOLID) al importar servicios directamente en los stores.

## What Changes

- **Migración a Runes**: Todos los stores (`.ts`) serán convertidos a clases con runes (`.svelte.ts`).
- **Inyección de Dependencias**: Implementación de Context API para inyectar stores en componentes, permitiendo desacoplamiento y mejor testabilidad.
- **ResponsiveTable Genérico**: Creación de un componente base para tablas que elimine la duplicación de lógica escritorio/móvil en todos los módulos.
- **Limpieza de Tipado**: Sustitución de `any` por interfaces específicas y corrección de imports rotos (`$lib/components/pure`).

## Capabilities

### New Capabilities

- `svelte5-state-management`: Sistema de gestión de estado global basado en clases y Runes.
- `generic-responsive-ui`: Componentes base (Tablas/Cards) para visualización de datos consistente.

### Modified Capabilities

- `store-pattern-standardization`: Actualización de la arquitectura de stores para alinearse con Svelte 5.

## Impact

- **Código**: Afecta a todos los archivos en `src/lib/stores/` y componentes en `src/lib/components/`.
- **Arquitectura**: Cambio de patrón singleton a Context API para stores globales.
- **Tipado**: Mejora de `src/lib/types.ts` y esquemas Zod.
