import { ValidationOptions, registerDecorator } from 'class-validator';
import { PasswordStrengthConstraint } from './password-strenth-constraint';

export function PasswordStrength(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'password-strength',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: PasswordStrengthConstraint,
    });
  };
}
