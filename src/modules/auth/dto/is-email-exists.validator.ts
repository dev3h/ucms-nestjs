import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/user/user.entity';

@ValidatorConstraint({ async: true })
export class IsEmailExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validate(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    return !!user;
  }

  defaultMessage(): string {
    return 'Email does not exist.';
  }
}

export function IsEmailExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailExistsConstraint,
    });
  };
}
