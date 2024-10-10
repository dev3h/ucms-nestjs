import { Module, Scope } from '@nestjs/common';
import { ActionService } from './action.service';
import { ActionController } from './action.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { ActionFilter } from './filters/action.filter';

@Module({
  imports: [TypeOrmModule.forFeature([Action])],
  controllers: [ActionController],
  providers: [
    ActionService,
    {
      provide: ActionFilter,
      useClass: ActionFilter,
      scope: Scope.REQUEST,
    },
  ],
  exports: [ActionService],
})
export class ActionModule {}
