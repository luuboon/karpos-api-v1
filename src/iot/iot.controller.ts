import { Body, Controller, Get, Post, Put, Param, Query, Logger } from '@nestjs/common';
import { IotService } from './iot.service';
import { Public } from '../auth/decorators/public.decorator';
import { IotData } from './schemas/iot-data.schema';
import { Command } from './schemas/command.schema';

@Controller('iot')
export class IotController {
  private readonly logger = new Logger(IotController.name);

  constructor(private readonly iotService: IotService) {}

  @Public()
  @Post()
  async createRecord(@Body() data: any): Promise<IotData> {
    this.logger.log('Datos IoT recibidos del dispositivo:');
    this.logger.log(JSON.stringify(data));
    
    // Normalización de datos
    if (data.cita && !data.citaId) {
      data.citaId = data.cita;
    }
    
    // Verificar formato de arrays
    if (data.pulso && !Array.isArray(data.pulso)) {
      try {
        data.pulso = JSON.parse(data.pulso);
      } catch (e) {
        this.logger.error(`Error parseando pulso: ${e.message}`);
        data.pulso = [];
      }
    }
    
    if (data.fuerza && !Array.isArray(data.fuerza)) {
      try {
        data.fuerza = JSON.parse(data.fuerza);
      } catch (e) {
        this.logger.error(`Error parseando fuerza: ${e.message}`);
        data.fuerza = [];
      }
    }
    
    return this.iotService.create(data);
  }

  @Public()
  @Get()
  async findAll(): Promise<IotData[]> {
    return this.iotService.findAll();
  }

  @Public()
  @Get('cita/:citaId')
  async findByCitaId(@Param('citaId') citaId: string): Promise<IotData[]> {
    return this.iotService.findByCitaId(citaId);
  }

  @Public()
  @Get('cita/:citaId/stats')
  async getStatsByCitaId(@Param('citaId') citaId: string): Promise<any> {
    return this.iotService.getStatsByCitaId(citaId);
  }

  @Public()
  @Get('fecha/:fecha')
  async findByDate(@Param('fecha') fecha: string): Promise<IotData[]> {
    return this.iotService.findByDate(fecha);
  }

  @Public()
  @Post('command')
  async createCommand(@Body() data: { cmd: string, citaId?: string }): Promise<Command> {
    this.logger.log(`Comando recibido: ${data.cmd}, para cita: ${data.citaId || 'N/A'}`);
    return this.iotService.createCommand(data);
  }
  
  @Public()
  @Get('command/latest')
  async getLatestCommand(): Promise<Command | null> {
    return this.iotService.getLatestCommand();
  }
  
  @Public()
  @Put('command/:id/executed')
  async markCommandAsExecuted(@Param('id') id: string): Promise<Command | null> {
    return this.iotService.markCommandAsExecuted(id);
  }

  @Public()
  @Get('debug/latest')
  async getLatestData(@Query('limit') limit: number = 5): Promise<any> {
    try {
      const data = await this.iotService.getLatestData(limit);
      return {
        count: data.length,
        message: `Últimos ${limit} registros en MongoDB`,
        data: data
      };
    } catch (error) {
      this.logger.error(`Error en endpoint debug/latest: ${error.message}`);
      return { 
        error: error.message, 
        message: 'Error obteniendo datos recientes' 
      };
    }
  }

  @Public()
  @Get('status')
  async getStatus(): Promise<any> {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      message: 'El servicio IoT está funcionando correctamente'
    };
  }
} 