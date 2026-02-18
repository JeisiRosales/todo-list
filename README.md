# Todo List API - Backend Technical Documentation

## Overview
Este es el backend de una aplicación de **Gestión de Tareas (Todo List)**, diseñada para ser robusta, escalable y eficiente. Desarrollada con **NestJS** y **PostgreSQL**, esta API proporciona una solución completa para el manejo de tareas con soporte para usuarios, categorías y comentarios en tiempo real.

Fue creada como parte de la asignatura **Diseño de Bases de Datos** en la **Universidad de Oriente, Núcleo Nueva Esparta**.

---

## Herramientas y Tecnologías

El proyecto utiliza un stack moderno enfocado en el rendimiento y la tipificación fuerte:

- **Framework:** [NestJS](https://nestjs.com/) (Arquitectura modular).
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) (Relacional persistente).
- **Driver de BD:** `pg` (Pool de conexiones directo para máximo control y rendimiento).
- **Autenticación:** [Passport.js](https://www.passportjs.org/) con estrategia **JWT** (JSON Web Tokens).
- **Validación:** `class-validator` y `class-transformer`.
- **Documentación:** [Swagger/OpenAPI](https://swagger.io/).

---

## Características Principales

### Gestión de Tareas
- CRUD completo de tareas con estados: `Pendiente`, `En-Progreso`, `En-Revision`, `Completado`.
- **Consultas Optimizadas:** Uso de agregación JSON de PostgreSQL para obtener detalles completos (categorías y comentarios anidados) en una sola ida a la base de datos.
- Asignación de tareas entre usuarios y seguimiento de creadores.

### Categorías
- Clasificación de tareas mediante categorías con colores personalizados.
- Lógica inteligente para detectar categorías disponibles (no asociadas aún).

### Sistema de Comentarios
- Comunicación fluida dentro de las tareas.
- Auditoría automática de creadores y fechas mediante el servidor.

### Seguridad y Robustez
- **Autenticación JWT:** Rutas protegidas mediante guardias.
- **Manejo de Errores Global:** Filtro de excepciones de base de datos (`DatabaseExceptionFilter`) que estandariza las respuestas ante fallos de integridad o conexión.
- **Validación Estricta:** DTOs configurados para asegurar la integridad de los datos entrantes.

---

## Configuración e Instalación

### Requisitos Previos
- **Node.js** v20.x o superior.
- **PostgreSQL** v14.x o superior con extensión `uuid-ossp` habilitada.

### Paso 1: Clonar e Instalar
```bash
git clone https://github.com/JeisiRosales/todo-list.git
cd todo-list
npm install
```

### Paso 2: Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en lo siguiente:
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=todo-list
DB_PASSWORD=tu_password_seguro
DB_PORT=5432

# JWT
JWT_ACCESS_SECRET=tu_clave_secreta_super_segura
JWT_ACCESS_EXPIRATION=tu_tiempo_de_expiracion

JWT_REFRESH_SECRET=tu_clave_secreta_super_segura_refresh
JWT_REFRESH_EXPIRATION=tu_tiempo_de_expiracion_refresh
```

### Paso 3: Inicialización de la Base de Datos
1. Asegúrate de tener una base de datos llamada `todo-list` creada en PostgreSQL.
2. Ejecuta el script SQL ubicado en `script.sql/init.sql`. Este script creará la estructura de tablas y precargará datos de ejemplo.

---

## Ejecución

```bash
# Desarrollo
npm run start:dev
```

El servidor estará disponible en: `http://localhost:3000`

---

## Documentación de la API (Swagger)

La API cuenta con documentación interactiva autogenerada donde puedes probar todos los endpoints:

[http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Estructura del Proyecto

```text
src/
├── auth/          # Estrategias de autenticación y lógica de login
├── categories/    # Gestión de etiquetas y categorías
├── comments/      # Lógica de comentarios por tarea
├── common/        # Filtros, decoradores y utilidades globales
├── tasks/         # Núcleo del sistema: gestión de tareas y relaciones
├── users/         # Gestión de perfiles y usuarios
└── app.module.ts  # Punto de entrada de la arquitectura modular
```
