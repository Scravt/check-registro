# Sistema de Detección de Empleadores (Check-Registro)

Este proyecto es una aplicación web desarrollada con **React** y **Vite** diseñada para realizar auditorías cruzadas de registros de empleadores. Su función principal es identificar empleadores registrados en **ARCA** (Agencia de Recaudación y Control Aduanero) que no figuran en el padrón de la **Secretaría de Trabajo de Entre Ríos**.

## 🚀 Funcionalidades Principales

1.  **Carga de Archivos Local**:
    -   Interfaz "Drag & Drop" para cargar tres tipos de archivos de texto plano (.txt):
        -   **ARCA**: Archivo de domicilios de explotación.
        -   **Padrón Entre Ríos**: Listado de empleadores registrados en la provincia.
        -   **Relaciones Laborales**: Archivo complementario de detalles laborales.
    -   *Nota*: El procesamiento se realiza 100% en el navegador del usuario por seguridad y velocidad.

2.  **Análisis y Entrecruzamiento**:
    -   Parsea automáticamente los archivos para extraer **CUITs** y datos relevantes.
    -   Compara los registros de ARCA contra el padrón de Entre Ríos.
    -   Detecta automáticamente los CUITs que están en ARCA pero **NO** en Entre Ríos.

3.  **Visualización de Datos**:
    -   Tablas interactivas para revisar los datos cargados y los resultados.
    -   **Filtro de búsqueda**: Permite filtrar los resultados por CUIT o Razón Social en tiempo real.
    -   Indicadores visuales de totales y registros faltantes.

4.  **Exportación de Reportes**:
    -   **Excel (.xlsx)**: Genera una planilla de cálculo con todos los resultados filtrados.
    -   **PDF**: Genera un documento listo para imprimir con el listado de empleadores detectados.

## 🛠️ Tecnologías y Librerías Utilizadas

El proyecto utiliza las siguientes tecnologías clave:

| Librería | Propósito |
| :--- | :--- |
| **react** | Biblioteca principal para la construcción de la interfaz de usuario basada en componentes. |
| **vite** | Entorno de desarrollo y empaquetador (bundler) de próxima generación, ultra rápido. |
| **lucide-react** | Conjunto de iconos vectoriales modernos y ligeros para mejorar la UI/UX. |
| **xlsx** | Librería poderosa para la creación y descarga de hojas de cálculo de Excel directamente desde el navegador. |
| **jspdf** | Utilidad para generar documentos PDF mediante JavaScript de lado del cliente. |
| **jspdf-autotable** | Plugin para `jspdf` que facilita la creación de tablas complejas y estilizadas dentro de los documentos PDF. |
| **react-window** | Sistema de virtualización de listas para renderizar eficientemente grandes conjuntos de datos (aunque simplificado en versiones recientes para estabilidad). |

## 📂 Estructura del Proyecto

-   `/src/components`: Componentes UI reutilizables (`FileUploader`, `VirtualTable`).
-   `/src/hooks`: Lógica de negocio encapsulada (`useFileProcessor` para manejo de archivos).
-   `/src/utils`: Funciones auxiliares (`parser.js` para lectura de archivos, `exporter.js` para descargas).
-   `/public/files`: Archivos de ejemplo para pruebas.

## 🏁 Cómo iniciar

1.  Instalar dependencias:
    ```bash
    npm install
    ```
2.  Correr servidor de desarrollo:
    ```bash
    npm run dev
    ```
3.  Abrir el navegador en la URL indicada (usualmente `http://localhost:5173`).
