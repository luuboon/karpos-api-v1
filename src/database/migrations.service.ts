import { Inject, Injectable, Logger } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as databaseSchema from './schema';
import { DATABASE_CONNECTION } from './database.module';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Definir una interfaz para los errores de migración
interface MigrationError {
  sql: string;
  error: string;
}

@Injectable()
export class MigrationsService {
  private readonly logger = new Logger(MigrationsService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: LibSQLDatabase<typeof databaseSchema>,
  ) {}

  async applyMigrations(): Promise<string> {
    try {
      // Verificamos si podemos ejecutar una consulta básica antes de proceder
      const testResult = await this.testDatabaseConnection();
      this.logger.log(`Prueba de conexión: ${testResult}`);

      // Intentamos primero cargar desde la carpeta compilada
      let sqlFilePath = path.join(__dirname, 'migrations', 'turso-migrate.sql');
      
      // Si no existe, intentamos cargar desde la carpeta src
      if (!fs.existsSync(sqlFilePath)) {
        this.logger.log(`Archivo no encontrado en: ${sqlFilePath}, intentando en src...`);
        
        // Calculamos la ruta relativa a la carpeta src
        const rootDir = process.cwd();
        sqlFilePath = path.join(rootDir, 'src', 'database', 'migrations', 'turso-migrate.sql');
        
        this.logger.log(`Intentando cargar desde: ${sqlFilePath}`);
      }
      
      // Verificar si el archivo existe
      if (!fs.existsSync(sqlFilePath)) {
        this.logger.error(`Archivo no encontrado en ninguna ubicación: ${sqlFilePath}`);
        return `Error: Archivo de migración no encontrado en: ${sqlFilePath}. Verifica que exista en src/database/migrations/turso-migrate.sql`;
      }
      
      this.logger.log(`Archivo de migración encontrado: ${sqlFilePath}`);
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      this.logger.log(`Contenido leído: ${sqlContent.substring(0, 100)}...`);

      // Ejecutar todo el script SQL directamente
      try {
        this.logger.log('Ejecutando script SQL completo...');
        await this.database.run(sql.raw(sqlContent));
        this.logger.log('Script SQL ejecutado correctamente');
        
        // Probar la creación de trigger por separado
        await this.createTriggerDirectly();
        
        return 'Migraciones aplicadas exitosamente, incluyendo el trigger.';
      } catch (error) {
        this.logger.error('Error ejecutando script SQL:', error);
        return `Error ejecutando script SQL: ${error.message}`;
      }
    } catch (error) {
      this.logger.error('Error general aplicando migraciones:', error);
      return `Error aplicando migraciones: ${error.message}`;
    }
  }

  async testDatabaseConnection(): Promise<string> {
    try {
      // Realizar una consulta sencilla para verificar la conexión
      const result = await this.database.run(sql`SELECT 1 as test`);
      return `Conexión exitosa a la base de datos: ${JSON.stringify(result)}`;
    } catch (error) {
      this.logger.error('Error en prueba de conexión:', error);
      throw new Error(`Error de conexión a la base de datos: ${error.message}`);
    }
  }

  async getDeletedUsers() {
    try {
      const result = await this.database.run(sql`SELECT * FROM deleted_users`);
      return result;
    } catch (error) {
      this.logger.error('Error al obtener usuarios eliminados:', error);
      return { error: error.message, message: 'Error al obtener usuarios eliminados' };
    }
  }

  async deleteUser(userId: number) {
    try {
      // Primero obtenemos los datos del usuario antes de eliminarlo
      const userData = await this.database.run(sql`
        SELECT email, role
        FROM users 
        WHERE id = ${userId}
      `);
      
      if (!userData || !userData.rows || userData.rows.length === 0) {
        return { 
          error: 'Usuario no encontrado', 
          message: 'No se pudo encontrar al usuario para eliminarlo' 
        };
      }
      
      // Extraemos el email del usuario
      const userEmail = userData.rows[0].email;
      const userRole = userData.rows[0].role;
      
      // Obtenemos el nombre del usuario según su rol
      let userName = 'Usuario Eliminado';
      
      if (userRole === 'patient') {
        const patientData = await this.database.run(sql`
          SELECT nombre, apellido_p, apellido_m
          FROM patients
          WHERE id_us = ${userId}
        `);
        
        if (patientData && patientData.rows && patientData.rows.length > 0) {
          const patient = patientData.rows[0];
          userName = `${patient.nombre} ${patient.apellido_p} ${patient.apellido_m}`;
        }
      } else if (userRole === 'doctor') {
        const doctorData = await this.database.run(sql`
          SELECT nombre, apellido_p, apellido_m
          FROM doctors
          WHERE id_us = ${userId}
        `);
        
        if (doctorData && doctorData.rows && doctorData.rows.length > 0) {
          const doctor = doctorData.rows[0];
          userName = `${doctor.nombre} ${doctor.apellido_p} ${doctor.apellido_m}`;
        }
      }
      
      // Insertamos en la tabla deleted_users (simulando el trigger)
      await this.database.run(sql`
        INSERT INTO deleted_users (email, nombre) 
        VALUES (${userEmail}, ${userName})
      `);
      
      this.logger.log(`Usuario ${userEmail} (${userName}) registrado en deleted_users`);
      
      // Ahora eliminamos el usuario
      const result = await this.database.run(sql`DELETE FROM users WHERE id = ${userId}`);
      
      return { 
        message: 'Usuario eliminado exitosamente y guardado en historial', 
        result 
      };
    } catch (error) {
      this.logger.error('Error al eliminar usuario:', error);
      return { error: error.message, message: 'Error al eliminar usuario' };
    }
  }

  async getUserData(userId: number) {
    try {
      // Obtenemos los datos del usuario
      const userData = await this.database.run(sql`
        SELECT email, role
        FROM users 
        WHERE id = ${userId}
      `);
      
      if (!userData || !userData.rows || userData.rows.length === 0) {
        return null;
      }
      
      // Extraemos el email del usuario
      const userEmail = userData.rows[0].email;
      const userRole = userData.rows[0].role;
      
      // Obtenemos el nombre del usuario según su rol
      let userName = 'Usuario Eliminado';
      
      if (userRole === 'patient') {
        const patientData = await this.database.run(sql`
          SELECT nombre, apellido_p, apellido_m
          FROM patients
          WHERE id_us = ${userId}
        `);
        
        if (patientData && patientData.rows && patientData.rows.length > 0) {
          const patient = patientData.rows[0];
          userName = `${patient.nombre} ${patient.apellido_p} ${patient.apellido_m}`;
        }
      } else if (userRole === 'doctor') {
        const doctorData = await this.database.run(sql`
          SELECT nombre, apellido_p, apellido_m
          FROM doctors
          WHERE id_us = ${userId}
        `);
        
        if (doctorData && doctorData.rows && doctorData.rows.length > 0) {
          const doctor = doctorData.rows[0];
          userName = `${doctor.nombre} ${doctor.apellido_p} ${doctor.apellido_m}`;
        }
      }
      
      return {
        email: userEmail,
        role: userRole,
        nombre: userName
      };
    } catch (error) {
      this.logger.error('Error obteniendo datos del usuario:', error);
      throw new Error(`Error obteniendo datos del usuario: ${error.message}`);
    }
  }

  async executeDeleteUserProcedure(userId: number, email: string, nombre: string) {
    try {
      // Iniciamos una transacción para simular un procedimiento almacenado
      // En SQLite/Turso, esto es lo más cercano a un procedimiento almacenado real
      await this.database.run(sql`BEGIN TRANSACTION`);
      
      try {
        // 1. Insertar en la tabla deleted_users
        await this.database.run(sql`
          INSERT INTO deleted_users (email, nombre) 
          VALUES (${email}, ${nombre})
        `);
        
        this.logger.log(`Usuario ${email} (${nombre}) registrado en deleted_users vía procedimiento`);
        
        // 2. Eliminar el usuario
        await this.database.run(sql`DELETE FROM users WHERE id = ${userId}`);
        
        // Si llegamos aquí, todo ha ido bien, confirmar la transacción
        await this.database.run(sql`COMMIT`);
        
        return { success: true, message: 'Procedimiento ejecutado correctamente' };
      } catch (innerError) {
        // Si algo sale mal, revertir la transacción
        await this.database.run(sql`ROLLBACK`);
        throw innerError;
      }
    } catch (error) {
      this.logger.error('Error ejecutando procedimiento deleteUserWithLog:', error);
      throw new Error(`Error en el procedimiento almacenado: ${error.message}`);
    }
  }

  async deleteUserRaw(userId: number) {
    try {
      // Consulta que sólo hace DELETE, para ver si el trigger se activa
      const result = await this.database.run(sql`DELETE FROM users WHERE id = ${userId}`);
      
      return result;
    } catch (error) {
      this.logger.error('Error al eliminar usuario mediante SQL directo:', error);
      throw new Error(`Error al eliminar usuario con SQL directo: ${error.message}`);
    }
  }

  async getUsers() {
    try {
      const result = await this.database.run(sql`SELECT id, email, role FROM users`);
      return result;
    } catch (error) {
      this.logger.error('Error al obtener usuarios:', error);
      return { error: error.message, message: 'Error al obtener usuarios' };
    }
  }

  async createTriggerDirectly() {
    try {
      // Primero eliminamos el trigger si existe
      await this.database.run(sql.raw(`DROP TRIGGER IF EXISTS user_delete_trigger`));
      
      // Creamos un trigger con la sintaxis que funcionó
      const createTriggerSQL = `
      CREATE TRIGGER user_delete_trigger
      AFTER DELETE ON users
      BEGIN
        INSERT INTO deleted_users (email, nombre) VALUES (OLD.email, 'Trigger Creado Manualmente');
      END;
      `;
      
      await this.database.run(sql.raw(createTriggerSQL));
      
      // También intentamos crear el trigger original
      await this.database.run(sql.raw(`DROP TRIGGER IF EXISTS save_deleted_users`));
      const mainTriggerSQL = `
      CREATE TRIGGER save_deleted_users
      AFTER DELETE ON users
      BEGIN
        INSERT INTO deleted_users (email, nombre) VALUES (OLD.email, 'Usuario Eliminado via Trigger');
      END;
      `;
      
      await this.database.run(sql.raw(mainTriggerSQL));
      
      return { success: true, message: 'Triggers creados directamente con éxito' };
    } catch (error) {
      this.logger.error('Error creando trigger directamente:', error);
      return { 
        error: error.message, 
        message: 'Error al crear trigger directamente' 
      };
    }
  }
} 