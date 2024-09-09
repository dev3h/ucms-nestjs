import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/user/user.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@ValidatorConstraint({ async: true })
export class IsEmailExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(User)
    private readonly i18n: I18nService,
    private readonly userRepository: Repository<User>,
  ) {}

  async validate(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    return !!user;
  }

  defaultMessage(): string {
    console.log(this.i18n);
    return this.i18n.t('message.email.not-found', {
      lang: I18nContext.current().lang,
    });
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
