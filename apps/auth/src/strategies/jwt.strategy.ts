import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be defined');
    }
    console.log(
      'JwtStrategy - Initializing with secret length:',
      secret.length,
    );

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          console.log('resquest ########', request);
          const token =
            request?.cookies?.Authentication || request?.Authentication;
          console.log(
            'JwtStrategy - Extracting token from cookies:',
            token ? 'Token present' : 'No token',
          );
          return token;
        },
      ]),
      secretOrKey: secret,
    });
  }

  async validate({ userId }: TokenPayload) {
    console.log('JWT Strategy - validating token with userId:', userId);
    const user = await this.usersService.getUser({ _id: userId });
    console.log('JWT Strategy - found user:', user);
    return user;
  }
}
