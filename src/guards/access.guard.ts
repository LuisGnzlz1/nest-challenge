import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AccessGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const findHeaderAccess = 'x-tenant-id';
    const matchHeader = request.headers[findHeaderAccess];
    if (!matchHeader) {
      throw new UnauthorizedException(
        'No tiene el permiso necesario para consultar el endpoint',
      );
    }
    return true;
  }
}
