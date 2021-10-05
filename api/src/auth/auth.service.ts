import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtSignOptions } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import { apiConfig } from '../config';
import type { User } from '../users/user.schema';
import { UserService } from '../users/users.service';
import type { Token } from './jwt-auth.guard';

export interface TokenResponse {
  /* eslint-disable @typescript-eslint/naming-convention */
  access_token: string;
  refresh_token: string | null;
  /* eslint-enable @typescript-eslint/naming-convention */
}

export interface SocialUser {
  id: number | string;
  name: string;
  email: string;
}

export type Nullable<T> = { [P in keyof T]: T[P] | null };

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async validate(username: string, password: string): Promise<User> {
    const user = await this.userService.getUser(username);
    if (!user)
      throw new UnauthorizedException('User does not exist');

    if (!(await user.validatePassword(password)))
      throw new UnauthorizedException('Incorrect password');

    return user;
  }

  public async login(user: User): Promise<TokenResponse> {
    const payload: Token = {
      sub: user.id,
      username: user.username,
    };

    return {
      /* eslint-disable @typescript-eslint/naming-convention */
      access_token: await this.jwtService.signAsync(payload, this.getAccessTokenOptions()),
      refresh_token: apiConfig.get('accessTokenExpiration')
        ? await this.jwtService.signAsync(payload, this.getRefreshTokenOptions())
        : null,
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }

  public async loginWithRefreshToken(refreshToken: string): Promise<TokenResponse> {
    const decoded = this.jwtService.decode(refreshToken) as Token;
    if (!decoded)
      throw new BadRequestException('Failed to decode jwt');

    try {
      await this.jwtService.verifyAsync<Token>(refreshToken, this.getRefreshTokenOptions());
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.validateUserById(decoded.sub);
    return this.login(user);
  }

  public getRefreshTokenOptions(): JwtSignOptions {
    return this.getTokenOptions('refresh');
  }

  public getAccessTokenOptions(): JwtSignOptions {
    return this.getTokenOptions('access');
  }

  private getTokenOptions(type: 'access' | 'refresh'): JwtSignOptions {
    const options: JwtSignOptions = {
      secret: apiConfig.get(`${type}TokenSecret`),
    };

    const expiration = apiConfig.get(`${type}TokenExpiration`);
    if (expiration)
      options.expiresIn = expiration;

    return options;
  }
}
