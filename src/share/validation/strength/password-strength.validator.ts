import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as zxcvbn from 'zxcvbn';

@ValidatorConstraint({ name: 'passwordStrength', async: false })
export class PasswordStrengthValidator implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    const result = zxcvbn(password);
    return result.score >= 3; // Đảm bảo mật khẩu có độ mạnh từ 3 trở lên
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password is too weak. It must be stronger.';
  }
}
