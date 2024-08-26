import { Test, TestingModule } from '@nestjs/testing';
import { SubsystemController } from './subsystem.controller';
import { SubsystemService } from './subsystem.service';

describe('SubsystemController', () => {
  let controller: SubsystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubsystemController],
      providers: [SubsystemService],
    }).compile();

    controller = module.get<SubsystemController>(SubsystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
