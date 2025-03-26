-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS save_deleted_users;
DROP TRIGGER IF EXISTS user_delete_trigger;

-- Crear tabla para usuarios eliminados si no existe
CREATE TABLE IF NOT EXISTS deleted_users (
  id_du INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para guardar usuarios eliminados
CREATE TRIGGER save_deleted_users
AFTER DELETE ON users
BEGIN
  INSERT INTO deleted_users (email, nombre) 
  VALUES (OLD.email, 'Usuario Eliminado');
END; 