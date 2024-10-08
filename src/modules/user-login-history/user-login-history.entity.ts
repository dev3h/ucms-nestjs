import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('user_login_histories')
export class UserLoginHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ length: 255 })
  device_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_login: Date;

  @Column({ type: 'text' })
  token: string;

  @ManyToOne(() => User, (user) => user.loginHistory)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
