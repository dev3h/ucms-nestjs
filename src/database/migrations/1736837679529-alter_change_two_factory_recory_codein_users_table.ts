import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChangeTwoFactoryRecoryCodeinUsersTable1736837679529
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users MODIFY COLUMN two_factor_recovery_code TEXT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users MODIFY COLUMN two_factor_recovery_code varchar(255)`,
    );
  }
}
