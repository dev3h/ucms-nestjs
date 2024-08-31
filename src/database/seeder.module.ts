import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeeder } from './seeds/database-seeder';
import { DatabaseConfigModule } from './database-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), DatabaseConfigModule],
  providers: [SeederService, DatabaseSeeder],
  exports: [SeederService],
})
export class SeederModule {}
