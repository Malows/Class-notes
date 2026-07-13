## MODIFIED Requirements

### Requirement: Context-aware sidebar
The system SHALL provide a sidebar that shows sibling resources for the current context, prioritizing metadata-driven subject items when the academic metadata context is available.

#### Scenario: Prioritize metadata context
- **WHEN** the sidebar receives active academic metadata from SSR or the store
- **THEN** the system SHALL show the metadata-driven subjects ahead of transactional navigation items.

#### Scenario: Preserve fallback navigation
- **WHEN** the metadata context is missing or empty
- **THEN** the system SHALL continue to render the existing hierarchical navigation structure.
