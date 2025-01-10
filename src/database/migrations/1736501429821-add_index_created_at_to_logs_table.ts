import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexCreatedAtToLogsTable1736501429821 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `CREATE INDEX idx_created_at ON logs (created_at)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX idx_created_at ON logs`);
    }

}
