# 📑 Aplicación para la Generación Automatizada de un Diccionario de Datos 


## **Docente:** Mag. Patrick Cuadros Quiroga  

---

### **Integrantes:**  
- **Flores Melendez Andree Sebastian**  
- **Flores Ramos Mario Anthonio**  
- **Fernandez Villanueva Daleska Fernandez**  

---

## 🚨 Problemática 
En la actualidad, la documentación de bases de datos sigue siendo una tarea mayormente manual, lo que genera demoras y potenciales errores. Las herramientas existentes para la documentación de bases de datos son costosas o no ofrecen la flexibilidad necesaria para adaptarse a las necesidades de los estudiantes o desarrolladores que requieren una solución práctica y económica. Este proyecto surge para llenar esa brecha, ofreciendo una plataforma accesible que automatice la creación de diccionarios de datos a partir de bases de datos relacionales y no relacionales.

---

## 🎯 Objetivo General 

Desarrollar una aplicación que permita la generación automatizada de diccionarios de datos, facilitando la gestión continua de la información en sistemas de bases de datos.

---

## 💡 Objetivos Específicos 

- **Automatizar** la extracción de metadatos de bases de datos.
- **Generar** un diccionario de datos estructurado en un formato accesible.
- **Implementar** una interfaz de usuario amigable para gestionar los diccionarios de datos.
- **Facilitar** la integración de la aplicación con sistemas de gestión de bases de datos.

---

## 📝 Justificación 

El proyecto busca abordar la necesidad de automatización en la documentación de bases de datos, reduciendo los errores humanos y mejorando la eficiencia del proceso. La automatización no solo ahorrará tiempo, sino que también proporcionará una documentación precisa, actualizada y fácilmente accesible para todos los usuarios, desde estudiantes hasta profesionales.

**Beneficios clave**:

- **Automatización**: Reduce el tiempo y esfuerzo necesario para la creación de diccionarios de datos.
- **Accesibilidad**: Permite a cualquier usuario generar contenido visual sin experiencia en documentación técnica.
- **Eficiencia**: Uso de tecnologías como C# y React JS para garantizar una rápida generación y exportación.


---

# 📑 DataDictGen - Generador de Diccionarios de Datos

Aplicación web para generar diccionarios de datos automáticamente desde bases de datos relacionales y NoSQL.

## 🎯 Características

- Extracción automática de metadatos
- Documentación con IA (OpenAI)
- Exportación a PDF
- Soporte para múltiples BD
- Interfaz web moderna


## 📋 Requisitos

- .NET 8.0 SDK
- Node.js 18+
- Cuenta AWS
- OpenAI API Key



### GitHub Secrets (para deploy)
```
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

```

## ☁️ Despliegue AWS

### 1. Infraestructura con Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 2. Deploy con GitHub Actions
- Configurar secrets en GitHub
- Push tag: `git tag v1.0.0 && git push origin v1.0.0`
- O ejecutar workflow manualmente

## �️ Bases de Datos Soportadas

| Base de Datos | Puerto | Estado |
|---------------|--------|--------|
| SQL Server    | 1433   | ✅ |
| MySQL         | 3306   | ✅ |
| PostgreSQL    | 5432   | ✅ |
| MongoDB       | 27017  | ✅ |
| Redis         | 6379   | ✅ |
| Cassandra     | 9042   | ✅ |

## 🔌 API Endpoints

### Autenticación
```bash
POST /api/auth/login
POST /api/auth/register
```

### Metadatos
```bash
POST /api/metadata/test-connection
POST /api/metadata/database-preview
POST /api/metadata/table-schema
```

### Documentos
```bash
POST /api/word/generate-word
POST /api/word/generate-pdf
```

## � Equipo

- **Flores Melendez Andree Sebastian** 
- **Flores Ramos Mario Anthonio**
- **Fernandez Villanueva Daleska** 

