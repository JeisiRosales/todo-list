-- TAREAS
select * from tasks

-- RELACION ENTRE TAREAS Y CATEGORIAS
select * from task_categories

-- Listar tareas y categorias asociadas
select 
	t.task_id,
	t.task_name as task,
	case 
		when c.category_name is null then 'Sin categorias'
		else c.category_name
	end as "categoria asociada"
from tasks as t
left join task_categories as tc on tc.task_id = t.task_id
left join categories as c on c.category_id = tc.category_id
order by t.task_name

-- CATEGORIAS
select * from categories

-- COMENTARIOS
select * from comments

-- Listar tareas y comentarios asociados
select 
	t.task_name,
	u.user_name,
	c.comment_content,
	c.comment_date
from tasks as t
left join comments as c on c.comment_from_task = t.task_id
left join users as u on u.user_id = c.comment_creator
order by t.task_name

-- USUARIOS
select * from users