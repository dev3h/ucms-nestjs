import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

export type IsExistsConstraintInput = {
  tableName: string;
  column: string;
};

@ValidatorConstraint({ name: 'IsExistsConstraint', async: true })
@Injectable()
export class IsExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const { tableName, column }: IsExistsConstraintInput = args.constraints[0];

    const exists = await this.entityManager
      ?.getRepository(tableName)
      ?.createQueryBuilder(tableName)
      ?.where({ [column]: value })
      ?.getExists();

    return exists;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    const { column }: IsExistsConstraintInput =
      validationArguments?.constraints[0];
    const i18n = I18nContext.current();
    const capitalizeColumn = column.charAt(0).toUpperCase() + column.slice(1);
    return i18n.t('validation.exists', { args: { column: capitalizeColumn } });
  }
}
