## ADDED Requirements

### Requirement: Generic Responsive Container

El sistema SHALL proveer un componente `ResponsiveTable.svelte` que abstraiga la lógica de visualización dual (Tabla para escritorio y Cards para móvil).

#### Scenario: Automatic layout switching

- **WHEN** el ancho de la pantalla es mayor a 768px
- **THEN** el componente SHALL renderizar el snippet `desktop` (tabla).
- **WHEN** el ancho de la pantalla es menor o igual a 768px
- **THEN** el componente SHALL renderizar el snippet `mobile` (cards).

### Requirement: Snippet-based Data Rendering

El componente `ResponsiveTable` SHALL utilizar Svelte 5 snippets para permitir al consumidor definir el contenido de la tabla y las cards de forma desacoplada pero consistente.

#### Scenario: Custom row rendering

- **WHEN** el componente padre provee un snippet `row` con el ítem de datos
- **THEN** `ResponsiveTable` renderiza dicho ítem dentro de la estructura de tabla o card según corresponda.
