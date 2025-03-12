import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../users/schema';
import * as patientsSchema from '../patients/schema';
import * as doctorsSchema from '../doctors/schema';
import { eq } from 'drizzle-orm';
import { SignUpDto } from './dto/sign-up.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';

// Interfaz para el usuario de Google
interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: LibSQLDatabase<typeof schema>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser) {
    try {
      // Buscar si el usuario ya existe
      const existingUser = await this.database
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, googleUser.email))
        .limit(1);

      if (existingUser[0]) {
        // Si el usuario existe, actualizar información si es necesario
        console.log(`Usuario de Google encontrado: ${existingUser[0].email}`);

        // Generar tokens
        const tokens = await this.getTokens(
          existingUser[0].id,
          existingUser[0].email,
          existingUser[0].role,
        );
        await this.updateRefreshTokenHash(
          existingUser[0].id,
          tokens.refreshToken,
        );

        return {
          id: existingUser[0].id,
          email: existingUser[0].email,
          role: existingUser[0].role,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      } else {
        // Si el usuario no existe, crearlo
        console.log(`Creando nuevo usuario de Google: ${googleUser.email}`);

        // Generar una contraseña aleatoria que no se usará (el usuario se autenticará con Google)
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Insertar el nuevo usuario
        const result = await this.database
          .insert(schema.users)
          .values({
            email: googleUser.email,
            password: hashedPassword,
            role: 'patient', // Usar 'patient' en lugar de 'user' para cumplir con el enum
          })
          .returning();

        if (!result[0]) {
          throw new Error('No se pudo crear el usuario de Google');
        }

        const newUser = result[0];

        // Generar tokens
        const tokens = await this.getTokens(
          newUser.id,
          newUser.email,
          newUser.role,
        );
        await this.updateRefreshTokenHash(newUser.id, tokens.refreshToken);

        return {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      }
    } catch (error) {
      console.error('Error al validar usuario de Google:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    const user = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user[0]) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(password, user[0].password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      user[0].id,
      user[0].email,
      user[0].role,
    );
    await this.updateRefreshTokenHash(user[0].id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    await this.database
      .update(schema.users)
      .set({ refresh_token: null })
      .where(eq(schema.users.id, userId));
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user[0] || !user[0].refresh_token)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user[0].refresh_token,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      user[0].id,
      user[0].email,
      user[0].role,
    );
    await this.updateRefreshTokenHash(user[0].id, tokens.refreshToken);
    return tokens;
  }

  private async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.database
      .update(schema.users)
      .set({ refresh_token: hash })
      .where(eq(schema.users.id, userId));
  }

  private async getTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    try {
      await this.database.insert(schema.users).values({
        email: signUpDto.email,
        password: hashedPassword,
        role: signUpDto.role,
      });

      return { message: 'Usuario creado exitosamente' };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ForbiddenException('El email ya está registrado');
      }
      throw error;
    }
  }

  async registerPatient(registerPatientDto: RegisterPatientDto) {
    const hashedPassword = await bcrypt.hash(registerPatientDto.password, 10);

    try {
      // Crear usuario primero
      const userResult = await this.database
        .insert(schema.users)
        .values({
          email: registerPatientDto.email,
          password: hashedPassword,
          role: 'patient', // Siempre será paciente en este endpoint
        })
        .returning();

      if (!userResult[0]) {
        throw new Error('No se pudo crear el usuario');
      }

      const userId = userResult[0].id;

      // Crear paciente con el ID del usuario
      await this.database.insert(patientsSchema.patients).values({
        nombre: registerPatientDto.nombre,
        apellido_p: registerPatientDto.apellido_p,
        apellido_m: registerPatientDto.apellido_m,
        age: registerPatientDto.age,
        weight: registerPatientDto.weight,
        height: registerPatientDto.height,
        gender: registerPatientDto.gender,
        blood_type: registerPatientDto.blood_type,
        id_us: userId,
      });

      // Generar tokens para inicio de sesión automático
      const tokens = await this.getTokens(
        userId,
        registerPatientDto.email,
        'patient'
      );
      await this.updateRefreshTokenHash(userId, tokens.refreshToken);

      return {
        message: 'Paciente registrado exitosamente',
        ...tokens,
        userId
      };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ForbiddenException('El email ya está registrado');
      }
      console.error('Error al registrar paciente:', error);
      throw error;
    }
  }

  async registerDoctor(registerDoctorDto: RegisterDoctorDto) {
    const hashedPassword = await bcrypt.hash(registerDoctorDto.password, 10);

    try {
      // Crear usuario primero
      const userResult = await this.database
        .insert(schema.users)
        .values({
          email: registerDoctorDto.email,
          password: hashedPassword,
          role: 'doctor', // Siempre será doctor en este endpoint
        })
        .returning();

      if (!userResult[0]) {
        throw new Error('No se pudo crear el usuario');
      }

      const userId = userResult[0].id;

      // Crear doctor con el ID del usuario
      await this.database.insert(doctorsSchema.doctors).values({
        nombre: registerDoctorDto.nombre,
        apellido_p: registerDoctorDto.apellido_p,
        apellido_m: registerDoctorDto.apellido_m,
        prof_id: registerDoctorDto.prof_id,
        id_us: userId,
      });

      // Generar tokens para inicio de sesión automático
      const tokens = await this.getTokens(
        userId,
        registerDoctorDto.email,
        'doctor'
      );
      await this.updateRefreshTokenHash(userId, tokens.refreshToken);

      return {
        message: 'Doctor registrado exitosamente',
        ...tokens,
        userId
      };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('prof_id')) {
          throw new ForbiddenException('El ID profesional ya está registrado');
        } else {
          throw new ForbiddenException('El email ya está registrado');
        }
      }
      console.error('Error al registrar doctor:', error);
      throw error;
    }
  }
}
