import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) { }

  // Este método se ejecuta cuando el servidor arranca
  async onModuleInit() {
    try {
      const res = await this.pool.query('SELECT NOW()');
      console.log('Conexión a Postgres exitosa:', res.rows[0].now);
    } catch (err) {
      console.error('Error conectando a la BDD:', err.message);
    }
  }
}