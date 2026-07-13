Implementación del Contexto Académico Global para Dashboard (Metadata SSR Integration)
Objetivo General: Transformar el Panel de Acceso Rápido (Sidebar.svelte) en un componente inteligente que muestre no solo la navegación jerárquica tradicional, sino también un nuevo bloque dedicado al Contexto Académico Activo (Metadata), precargado mediante Server-Side Rendering (SSR). Este endpoint debe servir como la fuente única de verdad para el estado académico del usuario.

📐 Arquitectura y Flujo de Datos
El flujo de datos sigue: DB 
→
→ Repository 
→
→ Service 
→
→ API (
GET /metadata
GET /metadata) 
→
→ Store (metadataStore) 
→
→ SSR/Props 
→
→ Component (Sidebar.svelte).

I. Backend Layer (API & Business Logic)
1. Creación del Endpoint
Ruta: src/routes/api/v1/metadata
Método: GET
Propósito: Servir el payload completo del contexto académico.
Controlador (+server.ts): Debe ser simple y delegar toda la lógica al servicio.
2. Capa de Servicio (Service Layer)
Archivo (Actualización/Renombrado): src/lib/services/metadata.service.ts
Función Principal: getAcademicMetadata(): Promise<{ periodData: MetadataContextPayload }>
CRÍTICO - Lógica de Negocio: El servicio debe calcular la validez del periodo basado en dos criterios estrictos (utilizando la fecha actual del servidor):
YEAR(Ahora) == YEAR(Periodo)
MONTH(Ahora) <= SEMESTER(Periodo) (Donde Semester 1 = cuatrimestre I, Semester 2 = cuatrimestre II).
Retorno: Debe encapsular la información del Periodo y el listado de Subjects asociados en ese contexto activo.
3. Capa de Repositorios (Database Interaction)
Uso: Se debe modificar la lógica dentro de los repositorios existentes (period-repository.ts o similar). NO CREAR NUEVOS ARCHIVOS DE REPOSITORIO.
Tarea Técnica: Implementar una consulta SQL optimizada (JOINs y WHERE con fechas) que filtre por el periodo activo Y devuelva: a) Los datos de metadatos del período (year, semester/term). b) Una lista única de IDs y los nombres de los Subjects asociados a ese período.
4. Tipado y Esquemas (Typing & Schemas)
Añadir/Modificar: Definir las interfaces en src/lib/types/metadata.ts.
Payload Final (MetadataContextPayload): Debe contener:
typescript
interface MetadataContextPayload {
    periodData: { year: number; term: 'Cuatrimestre I' | 'Cuatrimestre II'; };
    subjects: Array<{ id: string, name: string, href: string }>; // El Subject debe llevar su ruta formateada.
}
DTO Schema: Actualizar src/lib/schemas/dto.schema.ts con el tipo MetadataDto.

II. State Management Layer (State & Data Flow)
1. Metadata Store
Archivo (NUEVO): src/lib/stores/metadata.svelte
Función: Gestionar el estado del contexto global académico (context: writable<MetadataContextPayload | null>).
Métodos Requeridos:
initializeStore(payload): Función para cargar datos al inicio, idealmente recibiendo la data de SSR.
fetchMetadataContext(): Llamada asíncrona al endpoint /v1/metadata.
2. SSR Integration (CRÍTICO)
Archivo: src/routes/+layout.server.ts (O el layout que envuelve el dashboard).
Tarea: Implementar la lógica de pre-carga: Al iniciar la petición, llamar a metadataService.getAcademicMetadata() y devolver este objeto como props ({ metadata: payload }) para ser consumido en la capa del componente.

III. Frontend Layer (Components & UI)
1. Componente Principal (Sidebar.svelte)
Actualización Lógica: Modificar el bloque $derived de subjectItems. Debe tener prioridad sobre los datos transaccionales y debe consumir los sujetos proporcionados por el nuevo contexto global si están disponibles.
typescript
// Prioridad: Metadata Context > Store State
const subjectItems = $derived(() => { /* ... lógica priorizada para usar context.activeMetadata */ });
});
Nuevo Componente de Renderización: Implementar la sección de Metadata que recibirá los datos y el renderizará usando <SidebarContextSection />.
2. Nuevo Bloque Contextual (<MetadataContextSection />)
Creación (Component): Se recomienda crear este componente para encapsular el nuevo bloque visual.
Contenido: Debe mostrar: a) El título del contexto (Cuatrimestre Activo). b) Los metadatos clave (Year y Term) en un formato destacado. c) La lista de materias activas utilizando la estructura SidebarContextItem con las rutas (href) pre-formateadas recibidas del metadata.
3. Componente Contextual Auxiliar
Archivo: src/lib/components/SidebarContextSection.svelte (Usado para todo). No requiere cambios funcionales, solo adaptación visual de la sección superior.

✅ Requisitos Operacionales y Pruebas
Testing Scope: Los tests deben verificar el flujo completo desde el Service 
→
→ Repository usando fechas manipuladas (jest.spyOn(Date) o similar) para asegurar que el criterio YEAR y MONTH <= SEMESTER es irrefutable.
SSR Test: Verificar en entorno de prueba (o desarrollo) que los datos del contexto académico se inyectan correctamente sin necesidad de ninguna llamada cliente-side.
Fallback State: Si la base de datos no tiene ningún período activo o si falla el endpoint, el sidebar debe mostrar un empty state elegante y mantener su funcionalidad de navegación jerárquica existente (Subject 
→
→ Period 
→
→ Commission).