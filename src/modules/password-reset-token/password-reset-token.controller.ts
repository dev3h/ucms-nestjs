import { Controller } from '@nestjs/common';
import { PasswordResetTokenService } from './password-reset-token.service';

@Controller('password-reset-token')
export class PasswordResetTokenController {
  constructor(
    private readonly passwordResetTokenService: PasswordResetTokenService,
  ) {}
}
