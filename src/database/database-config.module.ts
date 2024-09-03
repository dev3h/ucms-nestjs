import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { typeOrmAsyncConfig } from '@/config/typeorm.config';
import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    // TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseConfigModule {}
