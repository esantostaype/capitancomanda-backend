import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserId = createParamDecorator(
  ( data: unknown, ctx: ExecutionContext ) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user.userId
  }
)

export const BranchId = createParamDecorator(
  ( data: unknown, ctx: ExecutionContext ) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user.branchId
  }
)

export const IsOwner = createParamDecorator(
  ( data: unknown, ctx: ExecutionContext ) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user.isOwner
  }
)

export const OwnedRestaurantId = createParamDecorator(
  ( data: unknown, ctx: ExecutionContext ) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user?.ownedRestaurantId
  }
)