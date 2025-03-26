-- Script de migración para Turso (libSQL)
-- Versión: 1.0
-- Fecha: 08-04-2025

-- Tabla para los usuarios eliminados
CREATE TABLE IF NOT EXISTS deleted_users (
    id_du INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vista para datos de pacientes con su historial médico
CREATE VIEW IF NOT EXISTS paciendatos AS
SELECT p.id_pc, p.nombre, p.apellido_p, p.apellido_m, p.age, p.weight, p.height, p.gender, p.blood_type, m.diagnosis, m.treatment, m.notes
FROM patients p
LEFT JOIN medical_records m ON p.id_pc = m.id_pc;

-- Vista para detalles de citas
CREATE VIEW IF NOT EXISTS appointment_details AS
SELECT 
    ap.id_ap AS appointment_id,
    (SELECT nombre || ' ' || apellido_p || ' ' || apellido_m 
     FROM patients p 
     WHERE p.id_pc = ap.id_pc) AS patient_name,
    (SELECT nombre || ' ' || apellido_p || ' ' || apellido_m 
     FROM doctors d 
     WHERE d.id_dc = ap.id_dc) AS doctor_name,
    ap.date AS appointment_date,
    ap.time AS appointment_time,
    ap.status AS appointment_status
FROM appointments ap;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_patients_id_us ON patients(id_us);
CREATE INDEX IF NOT EXISTS idx_doctors_id_us ON doctors(id_us);
CREATE INDEX IF NOT EXISTS idx_appointments_id_pc ON appointments(id_pc);
CREATE INDEX IF NOT EXISTS idx_appointments_id_dc ON appointments(id_dc);
CREATE INDEX IF NOT EXISTS idx_medical_records_id_pc ON medical_records(id_pc);

-- Eliminar trigger existente y crear uno nuevo
DROP TRIGGER IF EXISTS save_deleted_users;

-- Crear el trigger usando la sintaxis correcta de SQLite
CREATE TRIGGER save_deleted_users 
AFTER DELETE ON users 
BEGIN 
    INSERT INTO deleted_users (email, nombre)
    VALUES (OLD.email, 'Usuario Eliminado via Trigger');
END; 