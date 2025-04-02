import { Controller, Post, Get, Param } from '@nestjs/common';
import { MigrationsService } from './migrations.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('migrations')
export class MigrationsController {
  constructor(private readonly migrationsService: MigrationsService) {}

  @Public()
  @Post('apply')
  async applyMigrations() {
    return this.migrationsService.applyMigrations();
  }

  @Public()
  @Get('test')
  async testConnection() {
    return { status: 'ok', message: 'Migration controller is working' };
  }

  @Public()
  @Get('deleted-users')
  async getDeletedUsers() {
    return this.migrationsService.getDeletedUsers();
  }

  @Public()
  @Post('delete-user/:id')
  async deleteUser(@Param('id') id: string) {
    return this.migrationsService.deleteUser(Number(id));
  }

  @Public()
  @Post('delete-user-procedure/:id')
  async deleteUserProcedure(@Param('id') id: string) {
    try {
      // Primero obtenemos los datos del usuario antes de eliminarlo
      const userData = await this.migrationsService.getUserData(Number(id));
      
      if (!userData) {
        return { 
          error: 'Usuario no encontrado', 
          message: 'No se pudo encontrar al usuario para eliminarlo' 
        };
      }

      // Verificar que el email no sea nulo y convertirlo a string
      if (!userData.email) {
        return {
          error: 'Email no encontrado',
          message: 'El usuario no tiene un email asociado'
        };
      }

      // Convertir el email a string explícitamente
      const emailString = String(userData.email);
      
      // Ejecutamos el "procedimiento almacenado" (simulado)
      const result = await this.migrationsService.executeDeleteUserProcedure(
        Number(id), 
        emailString,
        userData.nombre || '' // Aseguramos que nombre no sea nulo
      );
      
      return { 
        message: 'Usuario eliminado exitosamente usando procedimiento almacenado', 
        result 
      };
    } catch (error) {
      return { 
        error: error.message, 
        message: 'Error al eliminar usuario mediante procedimiento almacenado' 
      };
    }
  }

  @Public()
  @Post('delete-user-raw/:id')
  async deleteUserRaw(@Param('id') id: string) {
    try {
      // Eliminar usuario directamente con SQL para probar el trigger
      const result = await this.migrationsService.deleteUserRaw(Number(id));
      
      return { 
        message: 'Usuario eliminado usando SQL directo (probando trigger)', 
        result 
      };
    } catch (error) {
      return { 
        error: error.message, 
        message: 'Error al eliminar usuario con SQL directo' 
      };
    }
  }

  @Public()
  @Get('users')
  async getUsers() {
    return this.migrationsService.getUsers();
  }

  @Public()
  @Post('create-trigger')
  async createTrigger() {
    return this.migrationsService.createTriggerDirectly();
  }
} 