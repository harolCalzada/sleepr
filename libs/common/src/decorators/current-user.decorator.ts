import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../../../apps/auth/src/users/models/user.schema';
const getCurrentUserByContext = (context: ExecutionContext): UserDocument => {
  const req = context.switchToHttp().getRequest();
  return req.user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
