import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export function throwUnauthorizedException(): never {
  throw new UnauthorizedException('No tienes permisos para realizar esta acción.')
}

export class EnvConfig {
  private static configService: ConfigService

  public static init( configService: ConfigService ) {
    this.configService = configService
  }

  public static get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }

  public static get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL');
  }

  public static get backendUrl(): string {
    return this.configService.get<string>('BACKEND_URL');
  }

  public static get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  public static get sendgridApiKey(): string {
    return this.configService.get<string>('SENDGRID_API_KEY');
  }

  public static get sendgridFromEmail(): string {
    return this.configService.get<string>('SENDGRID_FROM_EMAIL');
  }
}