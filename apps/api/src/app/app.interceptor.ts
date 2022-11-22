import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { map, Observable } from 'rxjs';
  import { encrypt } from '@ricly/encrypter';
  
  @Injectable()
  export class AppInterceptor<T> implements NestInterceptor<T, string> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<string> {
      return next.handle().pipe(
        map((data) => {
          if (typeof data === 'object') {
            data = encrypt(data);
          }
          return data;
        })
      );
    }
  }
  