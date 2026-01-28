-- Extenciones para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tablas Independientes (Users, Categories)
CREATE TABLE USERS (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(100) NOT NULL,
    user_mail VARCHAR(150) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL
);

CREATE TABLE CATEGORIES (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(100) NOT NULL,
    category_descrip TEXT,
    category_color VARCHAR(7)
);

-- Tablas Dependientes (Tasks, Task_Categories, Comments)
CREATE TABLE TASKS (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_name VARCHAR(150) NOT NULL,
    task_descrip TEXT,
    task_story_points INTEGER DEFAULT 0 CHECK (task_story_points >= 0),
    task_daliver_date DATE,
    task_status VARCHAR(20) DEFAULT 'Pendiente' CHECK (task_status IN ('Pendiente', 'En Progreso', 'En Revisión', 'Completado')),
    task_creator UUID NOT NULL REFERENCES USERS(user_id), -- Id del creador, relacion con la tabla USERS
    task_asign_to UUID NOT NULL REFERENCES USERS(user_id) -- Id del asignado, relacion con la tabla USERS
);

-- Tablas de Relacion y Detalle (Task_Categories, Comments)
CREATE TABLE TASK_CATEGORIES (
    task_id UUID REFERENCES TASKS(task_id) ON DELETE CASCADE, -- Id de la tarea, relacion con la tabla TASKS
    category_id UUID REFERENCES CATEGORIES(category_id) ON DELETE CASCADE, -- Id de la categoria, relacion con la tabla CATEGORIES
    PRIMARY KEY (task_id, category_id) -- Llave primaria compuesta
);

CREATE TABLE COMMENTS (
    comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    comment_from_task UUID REFERENCES TASKS(task_id) ON DELETE CASCADE, -- Id de la tarea, relacion con la tabla TASKS
    comment_creator UUID REFERENCES USERS(user_id) ON DELETE CASCADE, -- Id del creador, relacion con la tabla USERS
    comment_content TEXT NOT NULL, 
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);