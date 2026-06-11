## ADDED Requirements

### Requirement: Table Component Organization

Todos los componentes de tabla SHALL estar organizados bajo el directorio `src/lib/components/tables/` para mejorar la mantenibilidad.

#### Scenario: Verify file location

- **WHEN** se navega en el sistema de archivos
- **THEN** los archivos `AssignmentTable`, `CommissionTable`, etc., SHALL estar en `src/lib/components/tables/`.

### Requirement: Enhanced Component Testing

Todos los componentes de tabla SHALL tener tests unitarios que verifiquen el renderizado de datos, renderizado vacío y las interacciones de los botones de acción.

#### Scenario: Test interaction

- **WHEN** se renderiza un componente de tabla con datos
- **THEN** el test SHALL verificar que la tabla renderiza los datos correctamente y las acciones son invocables.
