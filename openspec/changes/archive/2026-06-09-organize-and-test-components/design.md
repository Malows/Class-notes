## Context

Actualmente los componentes de tabla están desorganizados dentro de `src/lib/components/`. Además, los tests unitarios existentes son superficiales y no cubren adecuadamente todos los escenarios de interacción.

## Goals / Non-Goals

**Goals:**

- Estructurar componentes de tabla bajo `src/lib/components/tables/`.
- Incrementar la cobertura de tests unitarios (Vitest + Testing Library).
- Mantener la integridad de los componentes mediante la actualización correcta de los imports.

**Non-Goals:**

- Cambiar la lógica interna de los componentes (fuera de la estructura).

## Decisions

### 1. Estructura de Directorios

- **Decisión**: Mover componentes de tabla a `src/lib/components/tables/`.
- **Razón**: Mejora la navegabilidad y encapsulamiento.

### 2. Testing strategy

- **Decisión**: Añadir tests de interacción para cubrir casos como: renderizado vacío, renderizado con datos, click en botones de acción.
- **Razón**: Asegurar robustez ante cambios futuros en UI.

## Risks / Trade-offs

- **[Risk]** Imports rotos al mover componentes → **Mitigation**: Ejecutar un script para actualizar las referencias.
- **[Risk]** Regresiones en tests → **Mitigation**: Ejecutar `npm test` frecuentemente durante el proceso.
