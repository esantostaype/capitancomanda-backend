import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      userRole: request.user.userRole,
      branchId: request.user.branchId,
      userId: request.user.userId,
      ownedRestaurantId: request.user.ownedRestaurantId,
    };
  },
);