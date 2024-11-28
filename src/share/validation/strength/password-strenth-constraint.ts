import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as zxcvbn from 'zxcvbn';
import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@ValidatorConstraint({ name: 'PasswordStrengthConstraint', async: true })
@Injectable()
export class PasswordStrengthConstraint
  implements ValidatorConstraintInterface
{
  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const result = zxcvbn(value);
    return result.score >= 3; // Ensure password strength is at least 3
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    const i18n = I18nContext.current();
    return i18n.t('validation.weak');
  }
}
