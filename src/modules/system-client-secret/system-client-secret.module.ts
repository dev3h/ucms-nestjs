import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemClientSecret } from './entities/system-client-secret.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemClientSecret])],
  controllers: [],
  providers: [],
  exports: [],
})
export class SystemClientSecretModule {}
