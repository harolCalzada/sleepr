import { Injectable } from '@nestjs/common';
import { UserDocument } from './users/models/user.schema';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async login(user: UserDocument, response: Response) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };
    const token = this.jwtService.sign(tokenPayload);
    
    const expires = new Date();
    const expirationTime = this.configService.get<string>('JWT_EXPIRATION');
    if (!expirationTime) {
      throw new Error('JWT_EXPIRATION must be defined');
    }
    expires.setSeconds(
      expires.getSeconds() + parseInt(expirationTime),
    );

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
  }
}
