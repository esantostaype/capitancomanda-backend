import { UnauthorizedException } from '@nestjs/common'

export function throwUnauthorizedException(): never {
  throw new UnauthorizedException('No tienes permisos para realizar esta acción.')
}