import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Remueve propiedades del JSON que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si envían propiedades no permitidas
    transform: true,            // Transforma los datos de los payloads a los tipos del DTO
  }));

  // Filtro Global de Excepciones de Base de Datos
  app.useGlobalFilters(new DatabaseExceptionFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Proyecto BDD - API de Tareas')
    .setDescription('Documentación de los endpoints para el sistema de gestión de tareas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();