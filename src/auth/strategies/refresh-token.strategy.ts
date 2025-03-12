import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_REFRESH_SECRET no está definido');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const authHeader = req.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header found');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();
    return {
      ...payload,
      refreshToken,
    };
  }
}
