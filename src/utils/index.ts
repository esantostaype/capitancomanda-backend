import { UnauthorizedException } from '@nestjs/common'

export function throwUnauthorizedException(): never {
  throw new UnauthorizedException('No tienes permisos para realizar esta acción.')
}

export const frontEndUrl = process.env.FRONT_END_URL