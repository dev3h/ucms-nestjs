import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetTokenService } from './password-reset-token.service';

describe('PasswordResetTokenService', () => {
  let service: PasswordResetTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordResetTokenService],
    }).compile();

    service = module.get<PasswordResetTokenService>(PasswordResetTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
