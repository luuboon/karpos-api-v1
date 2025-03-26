import { createClient } from '@libsql/client';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as usersSchema from '../users/schema';
import * as doctorsSchema from '../doctors/schema';
import * as patientsSchema from '../patients/schema';
import * as appointmentsSchema from '../appointments/schema';
import * as medicalRecordsSchema from '../medical-records/schema';
import * as databaseSchema from './schema';

export const DATABASE_CONNECTION = 'database-connection';
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const client = createClient({
          url: configService.getOrThrow('DATABASE_URL'),
          authToken: configService.getOrThrow('DATABASE_TOKEN'),
        });

        return drizzle(client, {
          schema: {
            ...usersSchema,
            ...doctorsSchema,
            ...patientsSchema,
            ...appointmentsSchema,
            ...medicalRecordsSchema,
            ...databaseSchema,
          },
        });
      },
      inject: [ConfigService],
    }
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
