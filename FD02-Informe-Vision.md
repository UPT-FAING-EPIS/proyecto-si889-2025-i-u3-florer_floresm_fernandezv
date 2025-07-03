<p align="center">
  <img src="./media/logo-upt.png" alt="Logo UPT" width="120" />
</p>

<h2 align="center">UNIVERSIDAD PRIVADA DE TACNA</h2>
<h3 align="center">FACULTAD DE INGENIERÍA</h3>
<h4 align="center">Escuela Profesional de Ingeniería de Sistemas</h4>

<h2 align="center">Aplicación para la Generación Automatizada de un Diccionario de Datos</h2>

<p align="center"><strong>Curso:</strong> <em>Patrones de Software</em></p>
<p align="center"><strong>Docente:</strong> <em>Mag. Patrick Cuadros Quiroga</em></p>
<p align="center"><strong>Integrantes:</strong></p>

<p align="center"><em><strong>
Daleska Nicolle Fernandez Villanueva                   (2021070308)
</strong></em></p>

<p align="center"><em><strong>
Andree Sebastián Flores Meléndez                       (2017057494)
</strong></em></p>

<p align="center"><em><strong>
Mario Antonio Flores Ramos                             (2018000597)
</strong></em></p>

<p align="center"><strong>Tacna – Perú</strong></p>
<p align="center"><strong><em>2025</em></strong></p>

---

## Aplicación para la Generación Automatizada de un Diccionario de Datos</em>
### Documento de Visión
**Versión 2.0**

---

### CONTROL DE VERSIONES

| Versión | Hecha por | Revisada por | Aprobada por | Fecha       | Motivo            |
|:-------:|-----------|--------------|--------------|-------------|-------------------|
| 2.0     | AFM       | AFM          | AFM          | 11/06/2025  | Versión Original  |

---

**INDICE GENERAL**
#
[1.	Introducción](#_Toc52661346)

1.1	Propósito

1.2	Alcance

1.3	Definiciones, Siglas y Abreviaturas

1.4	Referencias

1.5	Visión General

[2.	Posicionamiento](#_Toc52661347)

2.1	Oportunidad de negocio

2.2	Definición del problema

[3.	Descripción de los interesados y usuarios](#_Toc52661348)

3.1	Resumen de los interesados

3.2	Resumen de los usuarios

3.3	Entorno de usuario

3.4	Perfiles de los interesados

3.5	Perfiles de los Usuarios

3.6	Necesidades de los interesados y usuarios

[4.	Vista General del Producto](#_Toc52661349)

4.1	Perspectiva del producto

4.2	Resumen de capacidades

4.3	Suposiciones y dependencias

4.4	Costos y precios

4.5	Licenciamiento e instalación

[5.	Características del producto](#_Toc52661350)

[6.	Restricciones](#_Toc52661351)

[7.	Rangos de calidad](#_Toc52661352)

[8.	Precedencia y Prioridad](#_Toc52661353)

[9.	Otros requerimientos del producto](#_Toc52661354)

b) Estandares legales

c) Estandares de comunicación	](#_toc394513800)37

d) Estandaraes de cumplimiento de la plataforma	](#_toc394513800)42

e) Estandaraes de calidad y seguridad	](#_toc394513800)42

[CONCLUSIONES](#_Toc52661355)

[RECOMENDACIONES](#_Toc52661356)

[BIBLIOGRAFIA](#_Toc52661357)

[WEBGRAFIA](#_Toc52661358)


<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

**<u>Informe de Visión</u>**

# 1. Introducción

## 1.1 Propósito

El propósito de este proyecto es diseñar e implementar una plataforma web que permita la generación automática de diccionarios de datos, extrayendo directamente la estructura y metadatos de bases de datos relacionales y no relacionales.

Con esta herramienta se busca facilitar la organización, análisis y documentación de los datos, reduciendo significativamente el tiempo requerido para elaborar diccionarios técnicos, asegurando consistencia y mejorando la comprensión de los sistemas de información en desarrollo o mantenimiento. Esta solución será especialmente útil en contextos donde la trazabilidad y claridad en la estructura de la base de datos es crítica para el trabajo colaborativo y la toma de decisiones.

## 1.2 Alcance

- Compatibilidad inicial con bases de datos relacionales y no relacionales  
- Permitir la extracción automática de metadatos (tablas, columnas, tipos de datos, claves primarias/foráneas, etc.)  
- Generación del diccionario de datos estructurado y exportable en formatos como PDF y Word  
- Inclusión de una interfaz de usuario amigable, orientada tanto a usuarios técnicos como estudiantes  
- Implementación de funcionalidades básicas de seguridad para proteger el acceso a la información  
- Mejora en los procesos de documentación, mantenimiento y comprensión de estructuras de bases de datos

## 1.3 Definiciones, Siglas y Abreviaturas

- **Diccionario de Datos**: Documento que describe la estructura de una base de datos, incluyendo sus entidades, atributos y relaciones  
- **ERD (Entity-Relationship Diagram)**: Representación gráfica de las relaciones entre entidades en una base de datos

## 1.4 Visión General

El sistema será una aplicación diseñada para asistir a desarrolladores, administradores de bases de datos y estudiantes en la generación automática de diccionarios de datos. Su principal funcionalidad será extraer y organizar la estructura de bases de datos relacionales y no relacionales, permitiendo una documentación técnica clara, ordenada y eficiente.

Esta herramienta simplificará el análisis estructural de las bases de datos, permitiendo identificar tablas, campos, tipos de datos, relaciones y colecciones, entre otros elementos clave. Además, ofrecerá opciones para exportar la información generada, facilitando su uso en informes, auditorías, mantenimientos y proyectos académicos.

---

# 2. Posicionamiento

## 2.1 Oportunidad de negocio

La documentación de bases de datos es fundamental para la escalabilidad, mantenimiento y auditoría de sistemas de información. Sin embargo, muchos desarrolladores y estudiantes de bases de datos deben realizar este proceso manualmente, lo que consume tiempo y aumenta la probabilidad de errores. Una aplicación que automatice este proceso mejorará la eficiencia y agilización en la documentación de bases de datos.

## 2.2 Definición del problema

En muchos entornos académicos y profesionales, los sistemas de bases de datos carecen de documentación técnica actualizada y estructurada, lo cual dificulta su comprensión, análisis e integración, especialmente para nuevos desarrolladores, administradores o equipos de mantenimiento.

La ausencia de un diccionario de datos automatizado genera retrasos en los procesos de desarrollo, migración y soporte, ya que obliga a realizar revisiones manuales para entender la estructura de la base de datos. Además, este problema se agrava al trabajar con múltiples motores de bases de datos, tanto relacionales como no relacionales, que requieren enfoques distintos para su documentación.

Este problema puede resolverse mediante el desarrollo de una herramienta que extraiga automáticamente la información del esquema de la base de datos, incluyendo tablas, campos, relaciones, tipos de datos o colecciones, y la presente de forma clara, estructurada y exportable. Así, se optimiza la gestión del conocimiento sobre los sistemas de información y se facilita el trabajo colaborativo, el mantenimiento y la toma de decisiones.

---

# 3. Vista General del Producto

## 3.1 Resumen de los interesados

Los interesados en este proyecto son las personas o grupos que se verán beneficiados con la implementación de la plataforma para la generación automatizada de diccionarios de datos. Cada uno de ellos cumple un rol clave en el desarrollo, uso y mejora continua del sistema. Los principales interesados en la aplicación son:

### Desarrolladores:
- Requieren herramientas que les permitan comprender rápidamente la estructura de bases de datos existentes  
- Utilizarán el diccionario de datos para facilitar la integración de sistemas, refactorización de código y documentación técnica  
- Se beneficiarán al documentar de forma automática las estructuras de base de datos de sus proyectos académicos  

### Estudiantes:
- Se beneficiarán al documentar de forma automática las estructuras de base de datos de sus proyectos académicos  
- Aprenderán buenas prácticas en la representación y análisis de esquemas de datos  

### Administradores de Bases de Datos:
- Necesitan mantener documentación actualizada para mejorar la gestión, auditoría y mantenimiento de sistemas  
- Utilizarán la herramienta para exportar información estructurada en formatos como PDF, Excel o JSON  

### Coordinadores Académicos y Docentes:
- Promoverán el uso de herramientas que fomenten la estandarización y la calidad de la documentación técnica  
- Mejorarán los procesos de enseñanza al disponer de herramientas prácticas para el análisis de estructuras de datos  

## 3.2 Resumen de los usuarios

### Estudiantes:
- Utilizarán la aplicación para documentar automáticamente las estructuras de bases de datos empleadas en sus proyectos académicos  
- Accederán a funcionalidades que permiten visualizar tablas, relaciones, colecciones, atributos y tipos de datos  
- Podrán exportar diccionarios de datos en formatos como PDF, Excel o JSON y consultar su historial de generación  

### Docentes:
- Usarán la plataforma para verificar la correcta documentación de las bases de datos en trabajos y prácticas  
- Evaluarán la calidad técnica y la organización de los diccionarios generados según criterios académicos  
- Podrán acceder a reportes sobre el uso de la herramienta y su impacto en la mejora de las competencias en bases de datos  

### Administradores del Sistema:
- Serán responsables de configurar y mantener la plataforma  
- Supervisarán la integración con diferentes motores de bases de datos (MySQL, SQL Server, MongoDB, etc.)  

## 3.3 Entorno de usuario

El sistema debe proporcionar una experiencia intuitiva y accesible, que permita a los usuarios generar y gestionar diccionarios de datos con facilidad. Sus principales características son:

- Accesibilidad multiplataforma  
- Interfaz fácil de usar  
- Procesamiento eficiente  
- Seguridad y privacidad  

## 3.4 Perfiles de los interesados

### Docentes:
- Interés: Mejorar la documentación técnica en proyectos de bases de datos  
- Expectativas: Herramienta que estandarice los diccionarios generados  
- Beneficio esperado: Mejora en el proceso de enseñanza y calidad de informes  

### Coordinadores Académicos:
- Interés: Elevar el nivel de documentación técnica  
- Expectativas: Acceder a reportes e indicadores sobre el uso del sistema  

### Estudiantes:
- Interés: Facilitar la generación de documentación técnica  
- Expectativas: Resultados exportables, precisos y organizados  
- Beneficio esperado: Ahorro de tiempo y fortalecimiento de competencias  

## 3.5 Perfiles de los usuarios

### Docentes:
- Supervisión y evaluación de diccionarios  
- Optimización del aprendizaje  
- Monitoreo del progreso estudiantil  

### Estudiantes:
- Documentación automatizada  
- Comprensión estructural  
- Aprendizaje práctico  

## 3.6 Necesidades de los interesados y usuarios

### Docentes:
- Evaluar estructuras mediante documentación automatizada  
- Mejorar el aprendizaje en modelado relacional  
- Esperar diccionarios normalizados y comprensibles  

### Estudiantes:
- Generar automáticamente diccionarios desde sus modelos  
- Reducir el tiempo de documentación manual  
- Mejorar comprensión y presentación de sus trabajos  


# 4. Estudio de Factibilidad

## 4.1 Perspectiva del producto
El sistema será una aplicación que permitirá la generación automatizada de diccionarios de datos, proporcionando una solución eficiente para la documentación y análisis de la estructura de bases de datos. También incluirá funcionalidades avanzadas para la exportación en diferentes formatos.

## 4.2 Resumen de capacidades
El sistema permitirá la conexión con bases de datos relacionales y no relacionales, la extracción automática de su estructura, la generación de diccionarios en diversos formatos, y contará con una interfaz optimizada para la visualización y exportación de información.

## 4.3 Suposiciones y dependencias
- La aplicación requerirá conexión a Internet estable para su funcionamiento óptimo en la nube.  
- Se dependerá de la estructura de la base de datos, por lo que bases de datos mal diseñadas podrían afectar la calidad del diccionario generado.  
- Se prevé que los usuarios tendrán conocimientos básicos de bases de datos para interpretar la documentación generada correctamente.

## 4.4 Costos y precios

| **Categoría**           | **Costo Total (S/)** |
|-------------------------|----------------------|
| Costos generales        | 500                  |
| Costos operativos       | 1,650                |
| Costos del ambiente     | 750                  |
| Costos de personal      | 10,200               |
| **Total**               | **13,100**           |

## 4.5 Licenciamiento e instalación
El sistema será desarrollado con tecnologías de código abierto y bajo una licencia que permita su uso académico y su futura escalabilidad. Para reducir costos de mantenimiento, la plataforma estará alojada en la nube y será accesible desde cualquier dispositivo con conexión a internet.

---

# 5. Características del producto

- **Automatización completa**: Generación automática de diccionarios de datos con extracción directa de bases de datos.  
- **Exportación flexible**: Soporte para múltiples formatos como PDF, por ejemplo.  
- **Compatibilidad con bases de datos**: Soportará bases de datos relacionales y no relacionales.  
- **Seguridad avanzada**: Protección de datos mediante cifrado y autenticación basada en roles.

---

# 6. Restricciones

- El rendimiento puede verse afectado con bases de datos extremadamente grandes.  
- **Dependencia de servicios externos**: Algunas funcionalidades, como la exportación de documentos o integración con plataformas de documentación requerirán el uso de servicios o bibliotecas de terceros.  
- **Requisitos del servidor**: El sistema deberá implementarse en un entorno compatible con ASP.NET Core, lo que limita su despliegue a servidores con dicha compatibilidad.

---

# 7. Rangos de Calidad

- **Precisión en la extracción de datos**: La aplicación deberá lograr una fidelidad superior al 95 % en la interpretación de la estructura de la base de datos, incluyendo tablas, relaciones, tipos de datos y restricciones.  
- **Velocidad de procesamiento**: El tiempo promedio para generar un diccionario de datos a partir de una base de datos de tamaño estándar no deberá superar los 5 segundos.  
- **Seguridad y privacidad**: El sistema implementará mecanismos de autenticación segura y cifrado de datos para proteger la información de las bases analizadas y de los usuarios.  
- **Interfaz intuitiva**: La plataforma contará con una interfaz amigable y accesible, diseñada para facilitar su uso por parte de estudiantes y desarrolladores sin necesidad de capacitación técnica avanzada.

---

# 8. Precedencia y Prioridad

El desarrollo del sistema seguirá una jerarquía de implementación basada en la criticidad de cada funcionalidad para cumplir con los objetivos del proyecto:

- **Extracción de base de datos**: Esta funcionalidad será priorizada, ya que constituye el núcleo del sistema. Incluirá la obtención automática de tablas, campos, tipos de datos, relaciones y restricciones desde el motor de base de datos.  
- **Exportación del diccionario de datos**: Se desarrollará la opción de exportar el diccionario en diferentes formatos, facilitando su integración en procesos de documentación o presentaciones.  
- **Optimización de rendimiento**: De manera continua, se realizarán ajustes para mejorar la velocidad de procesamiento, consumo de recursos y escalabilidad del sistema.

---

# 9. Otros requerimientos del producto

### a) Estándares legales
- **Cumplimiento de la privacidad**: La aplicación garantizará la protección de la información procesada, asegurando que los datos extraídos de documentos o bases de datos no se compartan sin autorización previa del usuario.  
- **Propiedad Intelectual**: Se respetarán los derechos de autor y condiciones de uso de plataformas integradas como GitHub. La aplicación no recopilará datos de forma automatizada sin consentimiento y se ajustará a los términos de servicio correspondientes.

### b) Estándares de comunicación
- **Protocolos de Internet**: Toda la comunicación entre cliente y servidor se realizará mediante el protocolo seguro HTTPS. Se implementará el estándar OAuth 2.0 para autenticación segura cuando sea necesaria la integración con servicios externos.  
- **Compatibilidad con Navegadores**: La plataforma será compatible con navegadores modernos como Google Chrome, Mozilla Firefox, Safari y Microsoft Edge.

### c) Estándares de cumplimiento de la plataforma
- Compatible con los principales navegadores web y sistemas operativos.  
- Diseño responsivo para su correcto funcionamiento en dispositivos móviles y de escritorio.

### d) Estándares de calidad y seguridad
- **Pruebas de Seguridad**: Se realizarán auditorías y pruebas periódicas para detectar vulnerabilidades como inyecciones SQL, accesos no autorizados o posibles ataques de denegación de servicio (DDoS).  
- **Cifrado de Datos**: Los datos sensibles, como credenciales de usuario y documentos procesados, serán protegidos mediante cifrado SSL/TLS, asegurando la confidencialidad y la integridad de la información.

---

# Conclusiones

- **Automatización efectiva de documentación**: La aplicación permite automatizar la generación de documentación técnica de bases de datos, lo que simplifica considerablemente su gestión, mantenimiento y análisis.  
- **Utilidad académica y profesional**: El sistema representa una herramienta valiosa tanto para estudiantes como para profesionales, al facilitar la creación rápida y precisa de reportes documentados.  
- **Visualización y comprensión mejorada**: La integración de herramientas de visualización y opciones de exportación contribuye significativamente a una mejor comprensión de las estructuras y relaciones en las bases de datos.  
- **Escalabilidad asegurada**: La arquitectura del sistema permite incorporar nuevas funcionalidades en el futuro, garantizando su crecimiento y adaptación a nuevas necesidades o tecnologías.

---

# Recomendaciones

- **Optimizar rendimiento en bases de datos extensas**: Es recomendable refinar los algoritmos de extracción y procesamiento para asegurar un rendimiento estable en entornos con grandes volúmenes de datos.  
- **Implementar capacitación y tutoriales interactivos**: Desarrollar materiales educativos, como guías paso a paso o tutoriales visuales, facilitará la adopción por parte de nuevos usuarios sin experiencia previa.  
- **Fortalecer la seguridad del sistema**: Se recomienda realizar auditorías de seguridad periódicas y aplicar controles avanzados para prevenir vulnerabilidades y proteger la información confidencial.

---

# Bibliografía

- Domínguez Vázquez, M. J. (2022). *Estructura argumental del nombre: Generación automática*. Estudios de Lingüística, 55(110), 732–761. https://doi.org/10.4067/S0718-09342022000300732  
- Rovira Esteva, S. (2024). *Base de datos con información detallada sobre las características de 51 diccionarios digitales de chino en función de 34 parámetros de análisis*. DataCite. https://doi.org/10.34810/data1405

---

# Webgrafía

- ¿Qué es un diccionario de datos y por qué es importante?  
https://datos.gob.es/es/blog/que-es-un-diccionario-de-datos-y-por-que-es-importante  

- ¿Qué es un Data Dictionary?  
https://reveland.es/que-es-un-data-dictionary-definicion-y-ejemplos/  
