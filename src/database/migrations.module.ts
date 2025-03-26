import { Module } from '@nestjs/common';
import { MigrationsService } from './migrations.service';
import { MigrationsController } from './migrations.controller';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MigrationsService],
  controllers: [MigrationsController],
  exports: [MigrationsService],
})
export class MigrationsModule {} 