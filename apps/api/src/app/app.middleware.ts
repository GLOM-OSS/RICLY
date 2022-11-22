import { NestMiddleware } from '@nestjs/common';
import { decrypt } from '@ricly/encrypter';
import { Request } from 'express';

export class AppMiddleware implements NestMiddleware {
  async use(request: Request, response: Response, next: (error?) => void) {
    if (typeof request.params.data === 'string') {
      // console.log('request.params...');
      request.params = decrypt(request.params.data);
    }
    if (typeof request.body.data === 'string') {
      // console.log('request.body...');
      request.body = decrypt(request.body.data);
    }
    if (typeof request.query.data === 'string') {
      // console.log('request.query...');
      request.query = decrypt(request.query['data'] as string);
    }

    next();
  }
}
