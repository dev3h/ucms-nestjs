import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Subsystem } from '../../subsystem/entities/subsystem.entity';
import { SystemToken } from '@/modules/system-token/entities/system-token.entity';

@Entity({ name: 'systems' })
// @Unique(['name', 'code', 'client_id', 'client_secret'])
export class System {
  @ApiProperty({ description: 'Primary key as System ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'System name', example: 'Main System' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'System code', example: 'SYS_001' })
  @Column({ length: 255 })
  code: string;

  @ApiProperty({ description: 'Client ID' })
  @Column({ length: 255 })
  client_id: string;

  @ApiProperty({ description: 'Client Secret' })
  @Column({ length: 255 })
  client_secret: string;

  @ApiProperty({ description: 'Redirect URI' })
  @Column()
  redirect_uris: string;

  @OneToMany(() => Subsystem, (subsystem) => subsystem.system)
  subsystems: Subsystem[];

  @ApiProperty({ description: 'When system was created' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'When system was updated' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: 'When system was deleted' })
  @DeleteDateColumn()
  deleted_at?: Date;

  @OneToMany(() => SystemToken, (systemToken) => systemToken.system)
  systemTokens: SystemToken[];
}
