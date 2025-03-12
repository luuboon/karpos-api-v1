import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_TOKEN as string,
  });

  const db = drizzle(client);

  console.log('Migrando la base de datos...');

  try {
    // Eliminar tablas en orden inverso
    await client.execute(`DROP TABLE IF EXISTS medical_records`);
    await client.execute(`DROP TABLE IF EXISTS appointments`);
    await client.execute(`DROP TABLE IF EXISTS patients`);
    await client.execute(`DROP TABLE IF EXISTS doctors`);
    await client.execute(`DROP TABLE IF EXISTS users`);

    // Crear tablas en orden
    await client.execute(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        refresh_token TEXT,
        role TEXT NOT NULL DEFAULT 'patient' CHECK(role IN ('admin', 'doctor', 'patient')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE TABLE doctors (
        id_dc INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido_p TEXT NOT NULL,
        apellido_m TEXT NOT NULL,
        prof_id TEXT UNIQUE NOT NULL,
        id_us INTEGER NOT NULL,
        FOREIGN KEY (id_us) REFERENCES users(id)
      )
    `);

    await client.execute(`
      CREATE TABLE patients (
        id_pc INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido_p TEXT NOT NULL,
        apellido_m TEXT NOT NULL,
        age INTEGER NOT NULL,
        weight REAL NOT NULL,
        height REAL NOT NULL,
        gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')),
        blood_type TEXT NOT NULL,
        id_us INTEGER NOT NULL,
        FOREIGN KEY (id_us) REFERENCES users(id)
      )
    `);

    await client.execute(`
      CREATE TABLE appointments (
        id_ap INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pc INTEGER NOT NULL,
        id_dc INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
        payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed')),
        payment_amount REAL NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_pc) REFERENCES patients(id_pc),
        FOREIGN KEY (id_dc) REFERENCES doctors(id_dc)
      )
    `);

    await client.execute(`
      CREATE TABLE medical_records (
        id_mr INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pc INTEGER NOT NULL,
        diagnosis TEXT NOT NULL,
        treatment TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_pc) REFERENCES patients(id_pc)
      )
    `);

    console.log('Migración completada exitosamente!');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Error durante la migración:', err);
  process.exit(1);
});
