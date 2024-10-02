import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

export const jwtConfig: JwtModuleAsyncOptions = {
  useFactory: () => {
    return {
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    };
  },
};
