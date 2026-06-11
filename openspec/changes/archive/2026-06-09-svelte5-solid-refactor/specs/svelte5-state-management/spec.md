## ADDED Requirements

### Requirement: Svelte 5 State Classes

Todos los estados globales SHALL ser implementados como clases de TypeScript utilizando el rune `$state` para propiedades reactivas y `$derived` para valores calculados.

#### Scenario: Reactive state update

- **WHEN** un método de la clase modifica una propiedad marcada con `$state`
- **THEN** Svelte detecta el cambio automáticamente y actualiza los componentes que consumen dicha propiedad sin necesidad de suscripciones manuales.

### Requirement: Store Context Injection

El sistema SHALL proveer una forma estandarizada de inyectar y recuperar instancias de stores utilizando las funciones `setContext` y `getContext` de Svelte, encapsuladas en funciones auxiliares `set[Name]Context` y `get[Name]Context`.

#### Scenario: Injecting store in layout

- **WHEN** se invoca `set[Name]Context` en el archivo raíz `+layout.svelte`
- **THEN** cualquier componente hijo SHALL ser capaz de obtener la instancia del store mediante `get[Name]Context`.

### Requirement: Dependency Injection for Services

Las clases de store SHALL recibir sus dependencias (servicios de API) a través del constructor, permitiendo la inyección de mocks durante las pruebas unitarias.

#### Scenario: Mocking services in tests

- **WHEN** se instancia un store pasando un servicio mock en el constructor
- **THEN** el store SHALL utilizar los métodos del mock en lugar de realizar llamadas reales a la API.
