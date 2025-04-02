import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IotData } from './schemas/iot-data.schema';
import { Command } from './schemas/command.schema';

@Injectable()
export class IotService {
  private readonly logger = new Logger(IotService.name);

  constructor(
    @InjectModel(IotData.name) private iotDataModel: Model<IotData>,
    @InjectModel(Command.name) private commandModel: Model<Command>,
  ) {}

  async create(data: any): Promise<IotData> {
    this.logger.log(`Creando registro IoT con datos: ${JSON.stringify(data)}`);
    
    try {
      // Normalizar los datos
      const createdData = new this.iotDataModel({
        pulso: Array.isArray(data.pulso) ? data.pulso : [],
        fuerza: Array.isArray(data.fuerza) ? data.fuerza : [],
        fecha: data.fecha || new Date().toISOString().split('T')[0],
        cita: data.cita || data.citaId || 'N/A', // Acepta tanto 'cita' como 'citaId'
        deviceId: data.metadata?.deviceId || data.deviceId || 'ArduinoESP32',
        metadata: {
          ...data.metadata,
          receivedAt: new Date().toISOString(),
          app: 'KarposAPI',
          pulsoCount: Array.isArray(data.pulso) ? data.pulso.length : 0,
          fuerzaCount: Array.isArray(data.fuerza) ? data.fuerza.length : 0
        },
        timestamp: new Date(),
      });
      
      const result = await createdData.save();
      this.logger.log(`Registro IoT guardado correctamente con ID: ${result._id}`);
      
      // Buscar la cita correspondiente y registrar que tiene datos IoT
      if (data.cita || data.citaId) {
        this.logger.log(`Cita relacionada: ${data.cita || data.citaId}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error guardando datos IoT en MongoDB: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<IotData[]> {
    this.logger.log('Buscando todos los registros IoT');
    return this.iotDataModel.find().sort({ timestamp: -1 }).exec();
  }

  async findByCitaId(citaId: string): Promise<IotData[]> {
    this.logger.log(`Buscando registros IoT por citaId: ${citaId}`);
    return this.iotDataModel.find({ cita: citaId }).sort({ timestamp: -1 }).exec();
  }

  async findByDate(fecha: string): Promise<IotData[]> {
    this.logger.log(`Buscando registros IoT por fecha: ${fecha}`);
    return this.iotDataModel.find({ fecha }).sort({ timestamp: -1 }).exec();
  }

  async getStatsByCitaId(citaId: string): Promise<any> {
    this.logger.log(`Obteniendo estadísticas para citaId: ${citaId}`);
    
    const data = await this.iotDataModel.find({ cita: citaId }).sort({ timestamp: -1 }).exec();
    
    if (!data || data.length === 0) {
      return {
        citaId,
        found: false,
        message: 'No hay datos para esta cita'
      };
    }
    
    // Calcular estadísticas
    const stats = {
      citaId,
      found: true,
      registros: data.length,
      fechas: [...new Set(data.map(d => d.fecha))],
      ultimaActualizacion: data[0].timestamp,
      pulso: {
        totalMuestras: data.reduce((sum, d) => sum + (d.pulso?.length || 0), 0),
        promedioMuestras: data.length > 0 ? 
          data.reduce((sum, d) => sum + (d.pulso?.length || 0), 0) / data.length : 0,
        ultimoRegistro: data[0].pulso
      },
      fuerza: {
        totalMuestras: data.reduce((sum, d) => sum + (d.fuerza?.length || 0), 0),
        promedioMuestras: data.length > 0 ? 
          data.reduce((sum, d) => sum + (d.fuerza?.length || 0), 0) / data.length : 0,
        ultimoRegistro: data[0].fuerza
      }
    };
    
    return stats;
  }

  async createCommand(commandData: { cmd: string, citaId?: string }): Promise<Command> {
    this.logger.log(`Creando comando: ${JSON.stringify(commandData)}`);
    const command = new this.commandModel({
      cmd: commandData.cmd,
      citaId: commandData.citaId || null,
      executed: false,
      timestamp: new Date(),
    });
    const result = await command.save();
    this.logger.log(`Comando creado con ID: ${result._id}`);
    return result;
  }
  
  async getLatestCommand(): Promise<Command | null> {
    this.logger.log('Obteniendo último comando');
    return this.commandModel
      .findOne()
      .sort({ timestamp: -1 })
      .exec();
  }
  
  async markCommandAsExecuted(id: string): Promise<Command | null> {
    this.logger.log(`Marcando comando ${id} como ejecutado`);
    return this.commandModel
      .findByIdAndUpdate(id, { executed: true }, { new: true })
      .exec();
  }

  async getLatestData(limit: number = 5): Promise<IotData[]> {
    this.logger.log(`Obteniendo los últimos ${limit} registros de datos IoT`);
    return this.iotDataModel.find().sort({ timestamp: -1 }).limit(limit).exec();
  }
} 