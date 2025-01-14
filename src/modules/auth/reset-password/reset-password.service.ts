import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '@/modules/user/user.entity';
import { PasswordResetToken } from '@/modules/password-reset-token/entities/password-reset-token.entity';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '@/mail/mail.service';
import { ResponseUtil } from '@/utils/response-util';
import { UserTypeEnum } from '@/modules/user/enums/user-type.enum';
import { UserStatusEnum } from '@/modules/user/enums/user-status.enum';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly mailService: MailService,
  ) {}

  async sendMailResetPassword(body: any): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
        type: UserTypeEnum.ADMIN,
        status: UserStatusEnum.ACTIVE,
      },
    });
    if (!user) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.email.not-found', {
          lang: 'vi',
        }),
      );
    }

    const token = crypto.randomBytes(30).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);

    const dataToken = await this.passwordResetTokenRepository.findOne({
      where: { email: user.email },
    });
    if (dataToken) {
      await this.passwordResetTokenRepository.update(
        { email: user.email },
        { token: hashedToken },
      );
    } else {
      await this.passwordResetTokenRepository.save({
        email: user.email,
        token: hashedToken,
      });
    }
    const dataSend = {
      email: user.email,
      resetLink: `${process.env.FRONTEND_URL}/admin/reset-password?email=${user.email}&token=${token}`,
    };
    await this.mailService.addSendResetPasswordMailJob(dataSend);
    // await this.mailService.sendResetPasswordMail(user, token, 'reset-password');

    return ResponseUtil.sendSuccessResponse(
      null,
      this.i18n.t('message.Send-reset-password-successfully', {
        lang: 'vi',
      }),
    );
  }

  async ssoSendMailResetPassword(data) {
    const user = await this.userRepository.findOne({
      where: {
        phone_number: data.phone_number,
        email: data.email,
        type: UserTypeEnum.USER,
        status: UserStatusEnum.ACTIVE,
      },
    });

    if (!user) {
      throw new UnprocessableEntityException({
        errors: {
          phone_number: [
            this.i18n.t('message.phone.invalid', {
              lang: 'vi',
            }),
          ],
        },
        message: this.i18n.t('message.phone.invalid', {
          lang: 'vi',
        }),
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const token = crypto.randomBytes(30).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000);

    const dataToken = await this.passwordResetTokenRepository.findOne({
      where: { email: user.email, phone_number: user.phone_number },
    });
    if (dataToken) {
      await this.passwordResetTokenRepository.update(
        { email: user.email },
        { token: hashedToken, otp_code: otpCode.toString() },
      );
    } else {
      await this.passwordResetTokenRepository.save({
        email: user.email,
        phone_number: user.phone_number,
        token: hashedToken,
        otp_code: otpCode.toString(),
      });
    }
    const dataSend = {
      email: user.email,
      otpCode,
    };
    await this.mailService.addSendSSOResetPasswordMailJob(dataSend);
    // await this.mailService.sendResetPasswordMail(user, token, 'reset-password');

    return ResponseUtil.sendSuccessResponse(
      { data: { token } },
      this.i18n.t('message.Send-reset-password-successfully', {
        lang: 'vi',
      }),
    );
  }

  async verifyOtpCode(body): Promise<any> {
    const resetToken = await PasswordResetToken.findOne({
      where: {
        email: body?.email,
        phone_number: body?.phone_number,
        otp_code: body?.otp_code?.toString(),
      },
    });

    if (!resetToken) {
      throw new UnprocessableEntityException({
        errors: {
          otp_code: [
            this.i18n.t('message.invalid-otp-code', {
              lang: 'vi',
            }),
          ],
        },
        message: this.i18n.t('message.invalid-otp-code', {
          lang: 'vi',
        }),
        error: 'Unprocessable Entity',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
    const isTokenValid = await bcrypt.compare(body.token, resetToken.token);
    if (!isTokenValid) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.invalid-token', {
          lang: 'vi',
        }),
      );
    }

    return ResponseUtil.sendSuccessResponse({ data: { token: body?.token } });
  }

  async passwordResetUpdate(body): Promise<any> {
    const resetToken = await PasswordResetToken.findOne({
      where: { email: body?.email },
    });

    if (!resetToken) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.token-not-found', {
          lang: 'vi',
        }),
      );
    }

    const isTokenValid = await bcrypt.compare(body.token, resetToken.token);
    if (!isTokenValid) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.invalid-token', {
          lang: 'vi',
        }),
      );
    }

    await this.userRepository.update(
      { email: body?.email },
      {
        password: await bcrypt.hash(body?.password, 10),
        password_updated_at: new Date(),
      },
    );

    await PasswordResetToken.delete({ email: body?.email });

    return ResponseUtil.sendSuccessResponse(
      null,
      this.i18n.t('message.Reset-password-successfully', {
        lang: 'vi',
      }),
    );
  }

  async ssoPasswordResetUpdate(body): Promise<any> {
    const resetToken = await PasswordResetToken.findOne({
      where: { email: body?.email, phone_number: body?.phone },
    });

    if (!resetToken) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.token-not-found', {
          lang: 'vi',
        }),
      );
    }

    const isTokenValid = await bcrypt.compare(body.token, resetToken.token);
    if (!isTokenValid) {
      return ResponseUtil.sendErrorResponse(
        this.i18n.t('message.invalid-token', {
          lang: 'vi',
        }),
      );
    }

    await this.userRepository.update(
      { email: body?.email, phone_number: body?.phone },
      {
        password: await bcrypt.hash(body?.password, 10),
        password_updated_at: new Date(),
      },
    );

    await PasswordResetToken.delete({ email: body?.email });

    return ResponseUtil.sendSuccessResponse(
      null,
      this.i18n.t('message.Reset-password-successfully', {
        lang: 'vi',
      }),
    );
  }
}
