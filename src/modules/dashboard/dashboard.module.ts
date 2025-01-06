import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { User } from '../user/user.entity';
import { Role } from '../role/entities/role.entity';
import { DashboardController } from './dashboard.controller';
import { System } from '../system/entities/system.entity';

@Module({
  imports: [TypeOrmModule.forFeature([System, User, Role])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
