# UNIVERSIDAD PRIVADA DE TACNA
## FACULTAD DE INGENIERÍA
### Escuela Profesional de Ingeniería de Sistemas


# Aplicación para la Generación Automatizada de un Diccionario de Datos

**Curso:** Patrones de Software

**Docente:** Mag. Patrick Cuadros Quiroga

**Integrantes:**

*   Daleska Nicolle Fernandez Villanueva (2021070308)
*   Andree Sebastián Flores Meléndez (2017057494)
*   Mario Antonio Flores Ramos (2018000597)

<br>

**Tacna – Perú**
**2025**

---

# Aplicación para la Generación Automatizada de un Diccionario de Datos  
## Documento de Especificación de Requerimientos de Software  
**Versión 2.0**

---

## INTRODUCCIÓN

---

### I. Generalidades de la Empresa

**1. Nombre de la Empresa**  
DocuDB

**2. Visión**  
Convertirnos en una startup líder en el desarrollo de soluciones tecnológicas innovadoras y automatizadas que impulsen la eficiencia, calidad y competitividad de empresas, estudiantes y profesionales del sector TI a nivel nacional y regional.

**3. Misión**  
Diseñar y ofrecer productos tecnológicos que resuelvan problemas comunes en el desarrollo de software, automatización de procesos, gestión de datos y productividad digital, con foco en la simplicidad, eficiencia y accesibilidad.

---

### II. Visionamiento de la Empresa

**1. Descripción del Problema**  
La documentación manual de bases de datos es lenta, propensa a errores y afecta el mantenimiento y comprensión del sistema. Se propone una aplicación web para generar diccionarios de datos de manera automática y precisa.

**2. Objetivos de Negocios**  
- Automatizar documentación de BD.  
- Ser una herramienta confiable para desarrolladores, DBAs y estudiantes.  
- Incluir visualización, exportación y actualización automática.  
- Ofrecer como SaaS a instituciones y empresas.

**3. Objetivos de Diseño**  
- Interfaz intuitiva.  
- Sistema modular y escalable.  
- Arquitectura técnica sólida.  
- Exportación en formatos flexibles.

**4. Alcance del Proyecto**  
- Compatibilidad con BD relacionales y no relacionales.  
- Extracción de metadatos.  
- Generación exportable del diccionario (PDF, Word).  
- Seguridad básica de acceso.  
- Interfaz amigable para técnicos y estudiantes.

**5. Viabilidad del Sistema**  
Es viable con tecnologías actuales. Requiere inversión inicial, servidores y cumplimiento de normativas de protección de datos.

**6. Levantamiento de Información**  
Se aplicaron entrevistas y encuestas a estudiantes y desarrolladores. Se identificó que documentan manualmente, lo cual genera errores y desactualización. Herramientas actuales son poco intuitivas.

---

### III. Análisis de Procesos

1. Diagrama del Proceso Actual  
2. Diagrama del Proceso Propuesto  
*(No visualizables en texto)*

---

### IV. Especificación de Requerimientos de Software

#### 1. Requerimientos Funcionales Iniciales
- RF-001: Validación y conexión a base de datos.  
- RF-002: Extracción automática de estructura de tablas.  
- RF-003: Generación automática de descripciones con IA.  
- RF-004: Visualización estructurada tipo plantilla.  
- RF-005: Exportación del diccionario a Word o PDF.

#### 2. Requerimientos No Funcionales
- RNF-001: Rendimiento (<10s para 20 tablas).  
- RNF-002: Usabilidad.  
- RNF-003: Portabilidad.  
- RNF-004: Mantenibilidad.

#### 3. Requerimientos Funcionales Finales  
*(RF-001 al RF-029 listados detalladamente en el documento original)*

#### 4. Reglas de Negocio
- El sistema funciona en modo solo lectura.
- Generación automática sin intervención del usuario.
- Robustez ante estructuras incompletas.

---

### V. Fase de Desarrollo

#### 1. Perfiles de Usuario
- Estudiante / Desarrollador.  
- Docente.  
- Administrador del Sistema.

#### 2. Modelo Conceptual
- Diagrama de Paquetes.  
- Diagrama de Casos de Uso.  
- Escenarios narrativos de casos como:
  - Extraer estructura automáticamente.  
  - Generar descripciones con IA.  
  - Visualizar y editar descripciones.  
  - Exportar diccionario.  
  - Iniciar sesión.  
  - Registro de usuario.

#### 3. Modelo Lógico
- Análisis de Objetos.  
- Diagramas de Secuencia.  
- Diagrama de Clases.

---

## CONCLUSIONES

- Automatiza eficazmente la documentación técnica.  
- Útil para fines académicos y profesionales.  
- Mejora la comprensión mediante visualización clara.  
- Sistema escalable para futuras funcionalidades.

---

## RECOMENDACIONES

- Optimizar para BD extensas.  
- Implementar tutoriales y guías.  
- Realizar auditorías de seguridad.

---

## BIBLIOGRAFÍA

- Domínguez Vázquez, M. J. (2022). *Estructura argumental del nombre: Generación automática*.  
  https://doi.org/10.4067/S0718-09342022000300732  
- Rovira Esteva, S. (2024). *Base de datos de 51 diccionarios digitales de chino*.  
  https://doi.org/10.34810/data1405

---

## WEBGRAFÍA

- https://datos.gob.es/es/blog/que-es-un-diccionario-de-datos-y-por-que-es-importante  
- https://reveland.es/que-es-un-data-dictionary-definicion-y-ejemplos/
