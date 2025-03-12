import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser('sub') userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('sub') userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('register-patient')
  @HttpCode(HttpStatus.CREATED)
  registerPatient(@Body() registerPatientDto: RegisterPatientDto) {
    return this.authService.registerPatient(registerPatientDto);
  }

  @Public()
  @Post('register-doctor')
  @HttpCode(HttpStatus.CREATED)
  registerDoctor(@Body() registerDoctorDto: RegisterDoctorDto) {
    return this.authService.registerDoctor(registerDoctorDto);
  }

  // Rutas para autenticación con Google
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Este método no hace nada, solo inicia el flujo de autenticación
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      // El usuario ya está autenticado y disponible en req.user
      const user = req.user as any; // Usamos 'as any' para evitar errores de tipado

      if (!user) {
        return res.redirect('http://localhost:5173/login?error=auth_failed');
      }

      // Redirigir al frontend con los tokens
      const frontendUrl = 'http://localhost:5173'; // Cambia esto a la URL de tu frontend
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);

      // Añadir los tokens como parámetros de consulta
      if (user.accessToken) {
        redirectUrl.searchParams.append('accessToken', user.accessToken);
      }

      if (user.refreshToken) {
        redirectUrl.searchParams.append('refreshToken', user.refreshToken);
      }

      // Redirigir al frontend
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Error en la redirección de Google:', error);
      return res.redirect('http://localhost:5173/login?error=auth_failed');
    }
  }
}
