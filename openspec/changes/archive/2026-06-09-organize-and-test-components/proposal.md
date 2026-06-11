## Why

Actualmente los componentes de tabla están dispersos en `src/lib/components/`, lo que dificulta la localización y el mantenimiento. Además, la cobertura de tests es insuficiente para asegurar la estabilidad tras las refactorizaciones recientes.

## What Changes

- **Organización**: Crear `src/lib/components/tables/` y mover todos los componentes de tabla (`AssignmentTable`, `CommissionTable`, `FacultyTable`, `PeriodTable`, `StudentTable`) allí.
- **Testing**: Aumentar la cobertura de tests para estos componentes, asegurando que cubran casos de borde y comportamientos de usuario.
- **Limpieza**: Actualizar los imports en las rutas afectadas para reflejar la nueva estructura de directorios.

## Capabilities

### New Capabilities

- `component-organization`: Estructura de directorios lógica para componentes.
- `table-component-testing`: Cobertura de tests unitarios completa para componentes de tabla.

### Modified Capabilities

- `generic-responsive-ui`: Ajustar estructura de imports de `ResponsiveTable` y tablas hijas.

## Impact

- **Código**: Movimiento de archivos en `src/lib/components/`. Actualización de rutas en `src/routes/`.
- **Tests**: Creación/actualización de archivos `.test.ts`.
