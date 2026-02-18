import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';
import { DatabaseError } from 'pg';

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(DatabaseExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Verificamos si tiene la estructura de un error de Postgres
        if (this.isDatabaseError(exception)) {
            const error = exception as DatabaseError;
            let status = HttpStatus.INTERNAL_SERVER_ERROR;
            let message = 'Error interno del servidor';
            let errorType = 'Internal Server Error';

            switch (error.code) {
                case '23505': // unique_violation
                    status = HttpStatus.CONFLICT;
                    message = `Ya existe un registro con ese valor: ${error.detail}`;
                    errorType = 'Conflict';
                    break;
                case '22P02': // invalid_text_representation
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Formato de dato inválido';
                    errorType = 'Bad Request';
                    break;
                case '23502': // not_null_violation
                    status = HttpStatus.BAD_REQUEST;
                    message = `Falta el campo requerido: ${error.column}`;
                    errorType = 'Bad Request';
                    break;
                case '22001': // string_data_right_truncation
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Valor demasiado largo para el campo';
                    errorType = 'Bad Request';
                    break;
                case '23503': // foreign_key_violation
                    status = HttpStatus.BAD_REQUEST;
                    message = `Operación inválida por restricción de clave foránea: ${error.detail}`;
                    errorType = 'Bad Request';
                    break;
                default:
                    // Logueamos el error original para depuración si no es uno conocido
                    this.logger.error(`Database Error: ${error.message}`, error.stack);
                    break;
            }

            response.status(status).json({
                statusCode: status,
                message: message,
                error: errorType,
                path: request.url,
                timestamp: new Date().toISOString(),
            });
        } else {
            if (exception instanceof HttpException) {
                const status = exception.getStatus();
                const responseBody = exception.getResponse();
                response.status(status).json(responseBody);
            } else {
                this.logger.error(exception);
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                    path: request.url,
                });
            }
        }
    }

    private isDatabaseError(exception: any): boolean {
        // Verificación básica de propiedades comunes de errores de pg
        return exception && (exception.code !== undefined || exception.routine !== undefined) && exception.severity !== undefined;
    }
}
