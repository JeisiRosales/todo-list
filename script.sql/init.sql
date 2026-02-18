-- Extenciones para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DROP TABLES
DROP TABLE IF EXISTS COMMENTS;
DROP TABLE IF EXISTS TASK_CATEGORIES;
DROP TABLE IF EXISTS TASKS;
DROP TABLE IF EXISTS CATEGORIES;
DROP TABLE IF EXISTS USERS;

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
    task_delivery_date DATE,
    task_status VARCHAR(20) DEFAULT 'Pendiente' CHECK (task_status IN ('Pendiente', 'En-Progreso', 'En-Revision', 'Completado')),
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

-- Datos precargados
INSERT INTO USERS (user_name, user_mail, user_password) VALUES 
('Juan', 'juan@example.com', '$2a$12$qJIATGaF626c2i/RLDmOSulxbEBYKS2OpfrYny7TF70FHGTtaPKfG'), -- Pass: Juan123
('Jose', 'jose@example.com', '$2a$12$d7paRja6.mi0rwj8DacA/OxCc1N6HsG3mCp1B/9LzOhmza6ca54eC'); -- Pass: Jose123

INSERT INTO CATEGORIES (category_name, category_descrip, category_color) VALUES
('Personal', 'Vida cotidiana', '4CAF50'),
('Otro', 'Categoria variada', '2196F3');

INSERT INTO TASKS (task_name, task_descrip, task_story_points, task_delivery_date, task_status, task_creator, task_asign_to) VALUES
('Limpieza', 'Limpiar muebles del hogar.', 5, '2026-02-23', 'Pendiente', 
(SELECT user_id FROM USERS WHERE user_mail = 'juan@example.com'), 
(SELECT user_id FROM USERS WHERE user_mail = 'jose@example.com')),
('Estudiar', 'Estudiar para el examen de bases de datos.', 10, '2026-03-05', 'Pendiente', 
(SELECT user_id FROM USERS WHERE user_mail = 'jose@example.com'), 
(SELECT user_id FROM USERS WHERE user_mail = 'juan@example.com'));

INSERT INTO TASK_CATEGORIES (task_id, category_id) VALUES
((SELECT task_id FROM TASKS WHERE task_name = 'Limpieza'), (SELECT category_id FROM CATEGORIES WHERE category_name = 'Personal')),
((SELECT task_id FROM TASKS WHERE task_name = 'Estudiar'), (SELECT category_id FROM CATEGORIES WHERE category_name = 'Otro')),
((SELECT task_id FROM TASKS WHERE task_name = 'Estudiar'), (SELECT category_id FROM CATEGORIES WHERE category_name = 'Personal'));

INSERT INTO COMMENTS (comment_from_task, comment_creator, comment_content) VALUES
((SELECT task_id FROM TASKS WHERE task_name = 'Limpieza'), (SELECT user_id FROM USERS WHERE user_mail = 'juan@example.com'), 'Tener cuidado con la mesa de vidrio, es muy frágil.'),
((SELECT task_id FROM TASKS WHERE task_name = 'Estudiar'), (SELECT user_id FROM USERS WHERE user_mail = 'jose@example.com'), 'No olvides repasar los temas del Modelo Entidad-Relación.');
