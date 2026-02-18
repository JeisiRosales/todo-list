# Sistema de Gestión de Tareas (Todo List) - API REST

## Descripción del Proyecto
Este proyecto consiste en el desarrollo de una API REST para un sistema de gestión de tareas (Todo List), desarrollada para la asignatura **Diseño de Bases de Datos** en la **Universidad de Oriente, Núcleo Nueva Esparta**.

La API permite gestionar tareas, usuarios, categorías, comentarios y sus conexiones con una base de datos PostgreSQL, proporcionando una base sólida para aplicaciones frontend que requieran persistencia de datos y una estructura de backend organizada.

## Características Recientes
- **Manejo Global de Excepciones:** Se ha implementado un filtro global (`DatabaseExceptionFilter`) para capturar y estandarizar los errores de base de datos en toda la aplicación, mejorando la consistencia de las respuestas de error.
- **Módulo de Comentarios:** Nueva funcionalidad para gestionar comentarios asociados a tareas (CRUD completo).
- **Optimización de Consultas:** Mejoras en los endpoints de categorías para consultas más eficientes, como la obtención de categorías no asociadas a una tarea específica.

## Tecnologías Utilizadas
- **Framework:** [NestJS](https://nestjs.com/)
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL (Sin TypeORM, uso directo de `pg` pool para mayor control)
- **Documentación:** Swagger (disponible en `/api/docs`)

## Requisitos Previos
- Node.js (v14 o superior)
- PostgreSQL

## Configuración del Proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configuración de Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto con los siguientes parámetros (ajusta según tu configuración local):
   ```env
   DB_USER=tu_usuario
   DB_HOST=localhost
   DB_NAME=tu_base_de_datos
   DB_PASSWORD=tu_contraseña
   DB_PORT=5432
   ```

3. **Inicializar la base de datos:**
   1. Iniciar el servidor de PostgreSQL.
   2. Crear la base de datos llamada "todo-list".
   3. Ejecutar el script `init.sql` para crear las tablas necesarias.

4. **Ejecutar el proyecto:**
   ```bash
   # Modo desarrollo
   npm run start:dev
   ```

## Documentación de la API
Una vez que el servidor esté en funcionamiento, puedes acceder a la documentación interactiva de Swagger en:
[http://localhost:3000/api/docs](http://localhost:3000/api/docs)
