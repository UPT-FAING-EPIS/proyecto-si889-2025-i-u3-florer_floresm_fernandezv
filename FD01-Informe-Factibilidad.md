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
### Informe de Factibilidad  
**Versión 2.0**

---

### CONTROL DE VERSIONES

| Versión | Hecha por | Revisada por | Aprobada por | Fecha       | Motivo            |
|:-------:|-----------|--------------|--------------|-------------|-------------------|
| 2.0     | AFM       | AFM          | AFM          | 11/06/2025  | Versión Original  |

---

# ÍNDICE GENERAL

1. [Descripción del Proyecto](#descripción-del-proyecto)  
2. [Riesgos](#riesgos)  
3. [Análisis de la Situación Actual](#análisis-de-la-situación-actual)  
4. [Estudio de Factibilidad](#4-estudio-de-factibilidad)
   - [4.1 Factibilidad Técnica](#41-factibilidad-técnica)  
   - [4.2 Factibilidad Económica](#42-factibilidad-económica)  
   - [4.3 Factibilidad Operativa](#43-factibilidad-operativa)  
   - [4.4 Factibilidad Legal](#44-factibilidad-legal)  
   - [4.5 Factibilidad Social](#45-factibilidad-social)  
   - [4.6 Factibilidad Ambiental](#46-factibilidad-ambiental)  
5. [Análisis Financiero](#análisis-financiero)  
6. [Conclusiones](#conclusiones)  

---

## **Informe de Factibilidad**

### 1. Descripción del Proyecto

**1.1 Nombre del proyecto** 
Aplicación para la Generación Automatizada de un Diccionario de Datos

**1.2 Duración del proyecto** 
3 meses (desde la fase de análisis hasta la implementación y prueba del sistema)

**1.3 Descripción** 
El proyecto se enfoca en crear una aplicación que permita generar de forma automática un diccionario de datos a partir de la estructura de bases de datos, tanto relacionales como no relacionales. Esta herramienta está pensada para que desarrolladores, administradores de bases de datos, estudiantes y otros profesionales puedan documentar de manera rápida, ordenada y visual toda la información de una base de datos, ya sea en sistemas relacionales como no relacionales

**1.4 Objetivos**  
- Objetivo general
Desarrollar una aplicación que permita la generación automatizada de diccionarios de datos a partir de bases de datos existentes, facilitando la gestión y actualización continua de la información en sistemas de bases de datos.

- Objetivos específicos
●	Automatizar la extracción de metadatos de bases de datos.
●	Generar un diccionario de datos estructurado en un formato accesible
●	Implementar una interfaz de usuario amigable para gestionar los diccionarios de datos.
●	Facilitar la integración de la aplicación con sistemas de gestión de bases de datos.

---

### 2. Riesgos

Existen varios riesgos que podrían afectar el éxito del proyecto tales como:
●	La aplicación podría fallar o volverse lenta si procesa bases de datos muy grandes o muchos usuarios a la vez.
●	Bases de datos mal diseñadas pueden generar diccionarios con errores o incompletos.
●	Problemas con Internet o el servidor podrían dejar la herramienta inaccesible.
●	Sin buena seguridad, la información extraída podría estar en riesgo de ser vista por personas no autorizadas.

---

### 3. Análisis de la Situación Actual

**3.1 Planteamiento del problema**  
Hoy en día la mayoría de desarrolladores y administradores de bases de datos tienen que documentar manualmente la estructura de sus bases de datos. Esto no solo es tardado y tedioso, sino que también aumenta las probabilidades de cometer errores o de que la documentación no esté actualizada. Este proyecto busca resolver estas problemáticas mediante el desarrollo de una aplicación para la Generación Automatizada de Diccionarios de Datos, que permitirá documentar bases de datos de manera rápida, visual y precisa, mejorando así la eficiencia y el acceso a la información técnica dentro de los entornos académicos y profesionales.

**3.2 Consideraciones de hardware y software**  
Evaluación del hardware y software existentes o necesarios para la implementación.

---

### 4. Estudio de Factibilidad

Equipos (Hardware)
Se utilizarán 3 computadoras con características adecuadas para el desarrollo y prueba del sistema:

●	Procesador: Intel Core i5 de octava generación o similar, con buen rendimiento para trabajar en programación, hacer pruebas y administrar el sistema.
●	Sistema Operativo: Windows 10 o versiones más recientes. En caso de servidores, se recomienda usar Linux (si el proveedor de hosting lo permite) por ser más estable y económico.
●	Memoria RAM: 16 GB DDR4, que permite trabajar sin problemas con el entorno de desarrollo, ejecutar servidores locales y usar varias aplicaciones al mismo tiempo.
●	Accesorios: Monitor, teclado y mouse comunes serán suficientes para realizar las tareas necesarias

Programas y Herramientas (Software)

●	Lenguaje de programación: Se utilizará C# como lenguaje principal, junto con el framework ASP.NET Core para desarrollar el backend del sistema. Para la parte visual (frontend), se emplearán el framework React JS, lo que permitirá crear una interfaz interactiva y fácil de usar.
●	Base de datos: La información se almacenará en bases de datos relacionales y no relacionales, permitiendo registrar estructuras, relaciones y otros datos clave generados por la aplicación.

●	Entorno de desarrollo: Se trabajará con Visual Studio, ya que ofrece un entorno completo y eficiente para programar en C#, además de integrarse bien con múltiples tipos de bases de datos.
●	Hosting y dominio: El sistema se alojará en un servidor con dominio propio, compatible con aplicaciones desarrolladas en ASP.NET Core y con soporte para bases de datos tanto relacionales como no relacionales. Para proteger los datos, se implementará un certificado SSL, asegurando una conexión segura entre el usuario y la plataforma.


#### 4.1 Factibilidad Técnica

●	Hardware: Se utilizarán computadoras de gama media para el desarrollo, cada una con procesadores Intel Core i5 o superior y al menos 8 GB de RAM, suficientes para programar, probar y administrar el sistema de manera fluida. Para la gestión de datos y documentación, se requerirá un servidor con almacenamiento en la nube, lo que permitirá acceso remoto y seguro a la información generada por la aplicación.
●	Software: El sistema se desarrollará en C#, utilizando ASP.NET Core para el backend y React JS para la creación de la interfaz. Se emplearán bases de datos relacionales y no relacionales, ideales para almacenar tanto estructuras complejas como datos no estructurados. El proyecto se gestionará mediante GitHub, lo que permitirá control de versiones y trabajo colaborativo entre los desarrolladores.
●	Infraestructura de Red: Se requerirá una conexión a internet estable con una velocidad mínima de 100 Mbps, tanto para acceder al servidor como para garantizar la correcta sincronización del sistema, especialmente en su versión en la nube.

#### 4.2 Factibilidad Económica

Se analizaron los gastos relacionados con la creación, implementación y soporte continuo de la aplicación, concluyendo que el proyecto es sostenible desde el punto de vista económico. A continuación, se detallan los principales costos asociados a su desarrollo y funcionamiento.  

**Costeo del Proyecto**  
### 4.2.1 Costos Generales

| Concepto                                       | Cantidad | Costo Unitario (S/) | Subtotal (S/) |
|-----------------------------------------------|----------|----------------------|---------------|
| Licencias de software                         | 0        | 0                    | 0             |
| Material de oficina (papelería, impresora, tinta) | -        | 500                  | 500           |
| **Total**                                      |          |                      | **500**       |

---

### 4.2.2 Costos operativos durante el desarrollo

| Concepto                            | Cantidad | Costo Mensual (S/) | Total (S/) |
|-------------------------------------|----------|---------------------|-------------|
| Servicios básicos (agua, luz, internet) | 1        | 300                 | 900         |
| Servidor en la nube                 | 1        | 250                 | 750         |
| **Total**                           |          |                     | **1,650**   |

---

### 4.2.3 Costos del ambiente

| Concepto                               | Costos (S/) |
|----------------------------------------|--------------|
| Hosting                                | 250          |
| Dominio web (.com o .org)              | 100          |
| Infraestructura de red (router, cableado) | 400       |
| **Total**                              | **750**      |

---

### 4.2.4 Costos de personal

| Rol                          | Cantidad | Salario Mensual (S/) | Subtotal (S/) |
|-----------------------------|----------|------------------------|----------------|
| Desarrollador Backend       | 1        | 1,100                  | 3,300          |
| Desarrollador Frontend      | 1        | 1,200                  | 3,600          |
| Analista de Requerimientos | 1        | 1,100                  | 3,300          |
| **Total**                   |          |                        | **10,200**     |

---

### 4.2.5 Costos totales del desarrollo del sistema

| Categoría            | Costo Total (S/) |
|----------------------|------------------|
| Costos generales     | 500              |
| Costos operativos    | 1,650            |
| Costos del ambiente  | 750              |
| Costos de personal   | 10,200           |
| **Total**            | **13,100**       |


#### 4.3 Factibilidad Operativa

El sistema propuesto está enfocado en mejorar la documentación de bases de datos, facilitando el trabajo de desarrolladores, administradores y estudiantes al automatizar la creación de diccionarios de datos. Esta herramienta busca ahorrar tiempo y esfuerzo, evitando que los usuarios tengan que elaborar manualmente reportes. Además, permitirá integrar fácilmente la documentación con otras plataformas o herramientas de trabajo colaborativo.

Ventajas del sistema:
●	Automatización de la documentación: Permite generar diccionarios de datos de manera automática, reduciendo el riesgo de errores y agilizando el proceso de documentación técnica.
●	Mejor organización de la información: La estructura de la base de datos se presentará de forma clara y ordenada, facilitando su uso en auditorías, mantenimiento y desarrollo.
●	Escalable y adaptable: El sistema podrá ser actualizado e incluir nuevas funciones a futuro, como soporte para más motores de bases de datos o integraciones adicionales, según las necesidades del usuario.

#### 4.4 Factibilidad Legal

El desarrollo e implementación de esta aplicación deberá seguir todas las normas legales y de seguridad informática vigentes, garantizando que la información extraída de las bases de datos sea tratada de forma segura, ética y conforme a la ley.

●	Protección de datos personales: El sistema debe proteger la privacidad de la información procesada, evitando accesos no autorizados. Para ello, se aplicarán medidas de seguridad como cifrado y control de acceso, asegurando que los datos almacenados estén bien resguardados.
●	Propiedad intelectual: Se definirán términos de uso claros para evitar conflictos sobre la propiedad de la información documentada. La aplicación no podrá usarse para manipular, copiar o distribuir información de bases de datos sin la debida autorización.
●	Seguridad digital: La plataforma incluirá autenticación de usuarios y protocolos que eviten filtraciones de datos o accesos indebidos, cumpliendo con buenas prácticas en ciberseguridad.
●	Uso ético: Se promoverá un uso responsable de la aplicación, asegurando que la documentación generada sea utilizada con fines legales y profesionales, no para actividades indebidas.

#### 4.5 Factibilidad Social

Este proyecto tendrá un impacto social positivo, ya que facilitará la documentación de bases de datos y fomentará el uso de herramientas digitales modernas. Al ser una aplicación fácil de usar permitirá que estudiantes y profesionales organicen y visualicen información sin necesidad de software costoso o conocimientos técnicos avanzados. Su diseño intuitivo garantiza que cualquier persona pueda aprovechar sus beneficios, promoviendo así la accesibilidad y el uso responsable de la tecnología en entornos educativos y laborales

#### 4.6 Factibilidad Ambiental

●	Optimización del consumo energético: La automatización del proceso evita tareas manuales prolongadas, lo que permite un uso más eficiente de los equipos y menor consumo de energía.
●	Menor huella de carbono: Al permitir que los usuarios accedan a la documentación de forma remota, se reduce la necesidad de desplazarse, contribuyendo a la disminución de emisiones contaminantes.
●	Uso eficiente del almacenamiento digital: La organización automática y el control de versiones evitan la creación de archivos duplicados, optimizando el espacio en servidores y dispositivos.
●	Conciencia ecológica: Al utilizar esta herramienta, los usuarios desarrollan mayor conciencia sobre la importancia de la digitalización y el cuidado del medio ambiente en sus actividades académicas y profesionales.

---

### 5. Análisis Financiero

Evaluación de ingresos, egresos, y retorno económico del proyecto.

#### 5.1 Justificación de la Inversión

**5.1.1 Beneficios del Proyecto**  
La implementación de la aplicación para la Generación Automatizada de un Diccionario de Datos proporciona una serie de beneficios tanto tangibles como intangibles, que impactan directamente en la eficiencia y calidad de los procesos de desarrollo de software dentro de la organización.

Beneficios Tangibles:
●	Reducción del tiempo de documentación: Al automatizar la creación del diccionario de datos, se minimiza el tiempo invertido por analistas y desarrolladores en tareas manuales repetitivas.
●	Disminución de errores humanos: La automatización reduce significativamente la posibilidad de inconsistencias o errores en la documentación técnica.
●	Ahorro en costos operativos: Al mejorar la eficiencia del proceso de documentación, se reducen los costos asociados al uso prolongado de recursos y herramientas.


Beneficios Intangibles:
●	Mayor confiabilidad de la información: La información generada por la aplicación es precisa y estructurada, lo que mejora la calidad general del proyecto.
●	Toma acertada de decisiones: La disponibilidad inmediata de un diccionario de datos confiable facilita la toma de decisiones técnicas durante el desarrollo del sistema.
●	Mejora en la planificación y control de proyectos: Contar con documentación estructurada desde etapas tempranas permite una mejor planificación y seguimiento de avances.
●	Cumplimiento de estándares de calidad y normativas: La documentación automatizada ayuda a cumplir con buenas prácticas de desarrollo y requisitos exigidos por metodologías formales o auditorías.

---

**5.1.2 Criterios de Inversión**  
#### 5.1.2.1 Relación Beneficio/Costo (B/C)

**Inversión inicial:** S/. 13,100  
**Tasa de descuento:** 9%

| Periodo | Ingreso (S/.) | Egreso (S/.) | Flujo Efectivo (S/.) |
|---------|---------------|--------------|-----------------------|
| 0       | -             | -            | -13,100               |
| 1       | 14,000        | 6,000        | 8,000                 |
| 2       | 14,000        | 6,000        | 8,000                 |
| 3       | 14,000        | 6,000        | 8,000                 |

**Relación B/C:** **S/. 1.75**  
> Se obtiene S/. 0.75 de utilidad neta por cada sol de egreso operativo.

---

#### 5.1.2.2 Valor Actual Neto (VAN)

| Periodo | Ingreso (S/.) | Egreso (S/.) | Flujo Efectivo (S/.) |
|---------|---------------|--------------|-----------------------|
| 0       | -             | -            | -13,100               |
| 1       | 14,000        | 6,000        | 8,000                 |
| 2       | 14,000        | 6,000        | 8,000                 |
| 3       | 14,000        | 6,000        | 8,000                 |

**VAN:** **S/. 7,789.92**  
> El VAN positivo indica que el valor presente de los flujos de efectivo esperados es mayor al costo de la inversión inicial.  
> Esto sugiere que el proyecto **genera valor** y es **financieramente viable**.

---

#### 5.1.2.3 Tasa Interna de Retorno (TIR)

| Periodo | Ingreso (S/.) | Egreso (S/.) | Flujo Efectivo (S/.) |
|---------|---------------|--------------|-----------------------|
| 0       | -             | -            | -13,100               |
| 1       | 14,000        | 6,000        | 8,000                 |
| 2       | 14,000        | 6,000        | 8,000                 |
| 3       | 14,000        | 6,000        | 8,000                 |

**TIR:** **48%**  
> La TIR supera ampliamente la tasa de descuento (9%), lo que indica que el retorno esperado del proyecto es significativamente superior al costo del capital.  
> **Conclusión:** El proyecto es altamente rentable.

---

### 6. Conclusiones

El desarrollo de la aplicación para la Generación Automatizada de un Diccionario de Datos representa una solución tecnológica viable, útil y de gran impacto tanto en entornos académicos como profesionales. Esta herramienta automatiza un proceso que anteriormente era manual, propenso a errores y demandante de tiempo, logrando una mejora significativa en la calidad y eficiencia de la documentación técnica de bases de datos. La aplicación facilita la gestión, el mantenimiento y la comprensión de estructuras de datos, beneficiando directamente a desarrolladores, estudiantes y administradores de sistemas. Además, su diseño escalable y su interfaz amigable permite adaptarla a distintas necesidades y escenarios, también podemos decir que el proyecto es rentable, los cálculos realizados en el análisis económico demuestran que la inversión se recupera en un periodo razonable y se obtiene una buena ganancia, lo cual valida su viabilidad como producto sostenible. Esta rentabilidad, sumada a sus beneficios tangibles e intangibles, hace que el proyecto no solo sea factible de implementar, sino también recomendable.

---
