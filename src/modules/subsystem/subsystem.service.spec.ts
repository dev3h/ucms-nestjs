import { Test, TestingModule } from '@nestjs/testing';
import { SubsystemService } from './subsystem.service';

describe('SubsystemService', () => {
  let service: SubsystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubsystemService],
    }).compile();

    service = module.get<SubsystemService>(SubsystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
