import { MigrationInterface, QueryRunner } from 'typeorm';

export class UcmsMigration1725331113431 implements MigrationInterface {
  name = 'UcmsMigration1725331113431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`isChangePasswordFirst\` tinyint NOT NULL DEFAULT 0, \`status\` tinyint NOT NULL COMMENT '1: Active, 2: Suspend, 3: DeActive' DEFAULT '1', \`token_first_time\` varchar(255) NULL, \`two_factor_secret\` varchar(255) NULL, \`two_factor_recovery_code\` varchar(255) NULL, \`two_factor_enable\` tinyint NOT NULL DEFAULT 0, \`two_factor_confirmed_at\` datetime NULL, \`access_token\` varchar(255) NULL, \`refresh_token\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`actions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`modules\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`subsystems\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`systemId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`systems\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`password_reset_tokens\` (\`email\` varchar(255) NOT NULL, \`token\` varchar(255) NOT NULL, PRIMARY KEY (\`email\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`role_has_permissions\` (\`role_id\` int NOT NULL, \`permission_id\` int NOT NULL, INDEX \`IDX_9135e97d2d840f7dfd6e664911\` (\`role_id\`), INDEX \`IDX_09ff9df62bd01f8cf45b1b1921\` (\`permission_id\`), PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_has_roles\` (\`user_id\` int NOT NULL, \`role_id\` int NOT NULL, INDEX \`IDX_d2b980baf026ff8347d88ace6e\` (\`user_id\`), INDEX \`IDX_386dc0042695c976845d36be94\` (\`role_id\`), PRIMARY KEY (\`user_id\`, \`role_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_has_permissions\` (\`user_id\` int NOT NULL, \`permission_id\` int NOT NULL, INDEX \`IDX_338fbd9e726c66cd65176cb851\` (\`user_id\`), INDEX \`IDX_6c3e7c9682a0bd4879c475e5df\` (\`permission_id\`), PRIMARY KEY (\`user_id\`, \`permission_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`modules_actions\` (\`modulesId\` int NOT NULL, \`actionsId\` int NOT NULL, INDEX \`IDX_c05dc2c796ffa6e3de039c5693\` (\`modulesId\`), INDEX \`IDX_13a7084bfbfa92f992c61b232a\` (\`actionsId\`), PRIMARY KEY (\`modulesId\`, \`actionsId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`subsystems_modules\` (\`subsystemsId\` int NOT NULL, \`modulesId\` int NOT NULL, INDEX \`IDX_05cfa64c005835a697f1944228\` (\`subsystemsId\`), INDEX \`IDX_e8d648d2e03ffef49dca0b8bd4\` (\`modulesId\`), PRIMARY KEY (\`subsystemsId\`, \`modulesId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subsystems\` ADD CONSTRAINT \`FK_fe9cf66dc0588eb261d965afb09\` FOREIGN KEY (\`systemId\`) REFERENCES \`systems\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD CONSTRAINT \`FK_9135e97d2d840f7dfd6e6649116\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD CONSTRAINT \`FK_09ff9df62bd01f8cf45b1b1921a\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_has_roles\` ADD CONSTRAINT \`FK_d2b980baf026ff8347d88ace6ee\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_has_roles\` ADD CONSTRAINT \`FK_386dc0042695c976845d36be948\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_has_permissions\` ADD CONSTRAINT \`FK_338fbd9e726c66cd65176cb8512\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_has_permissions\` ADD CONSTRAINT \`FK_6c3e7c9682a0bd4879c475e5df6\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`modules_actions\` ADD CONSTRAINT \`FK_c05dc2c796ffa6e3de039c5693b\` FOREIGN KEY (\`modulesId\`) REFERENCES \`modules\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`modules_actions\` ADD CONSTRAINT \`FK_13a7084bfbfa92f992c61b232ae\` FOREIGN KEY (\`actionsId\`) REFERENCES \`actions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subsystems_modules\` ADD CONSTRAINT \`FK_05cfa64c005835a697f19442289\` FOREIGN KEY (\`subsystemsId\`) REFERENCES \`subsystems\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`subsystems_modules\` ADD CONSTRAINT \`FK_e8d648d2e03ffef49dca0b8bd42\` FOREIGN KEY (\`modulesId\`) REFERENCES \`modules\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`subsystems_modules\` DROP FOREIGN KEY \`FK_e8d648d2e03ffef49dca0b8bd42\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`subsystems_modules\` DROP FOREIGN KEY \`FK_05cfa64c005835a697f19442289\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`modules_actions\` DROP FOREIGN KEY \`FK_13a7084bfbfa92f992c61b232ae\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`modules_actions\` DROP FOREIGN KEY \`FK_c05dc2c796ffa6e3de039c5693b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_has_permissions\` DROP FOREIGN KEY \`FK_6c3e7c9682a0bd4879c475e5df6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_has_permissions\` DROP FOREIGN KEY \`FK_338fbd9e726c66cd65176cb8512\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_has_roles\` DROP FOREIGN KEY \`FK_386dc0042695c976845d36be948\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_has_roles\` DROP FOREIGN KEY \`FK_d2b980baf026ff8347d88ace6ee\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP FOREIGN KEY \`FK_09ff9df62bd01f8cf45b1b1921a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP FOREIGN KEY \`FK_9135e97d2d840f7dfd6e6649116\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`subsystems\` DROP FOREIGN KEY \`FK_fe9cf66dc0588eb261d965afb09\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e8d648d2e03ffef49dca0b8bd4\` ON \`subsystems_modules\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_05cfa64c005835a697f1944228\` ON \`subsystems_modules\``,
    );
    await queryRunner.query(`DROP TABLE \`subsystems_modules\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_13a7084bfbfa92f992c61b232a\` ON \`modules_actions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c05dc2c796ffa6e3de039c5693\` ON \`modules_actions\``,
    );
    await queryRunner.query(`DROP TABLE \`modules_actions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_6c3e7c9682a0bd4879c475e5df\` ON \`user_has_permissions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_338fbd9e726c66cd65176cb851\` ON \`user_has_permissions\``,
    );
    await queryRunner.query(`DROP TABLE \`user_has_permissions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_386dc0042695c976845d36be94\` ON \`user_has_roles\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d2b980baf026ff8347d88ace6e\` ON \`user_has_roles\``,
    );
    await queryRunner.query(`DROP TABLE \`user_has_roles\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_09ff9df62bd01f8cf45b1b1921\` ON \`role_has_permissions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9135e97d2d840f7dfd6e664911\` ON \`role_has_permissions\``,
    );
    await queryRunner.query(`DROP TABLE \`role_has_permissions\``);
    await queryRunner.query(`DROP TABLE \`password_reset_tokens\``);
    await queryRunner.query(`DROP TABLE \`systems\``);
    await queryRunner.query(`DROP TABLE \`subsystems\``);
    await queryRunner.query(`DROP TABLE \`modules\``);
    await queryRunner.query(`DROP TABLE \`actions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`roles\``);
    await queryRunner.query(`DROP TABLE \`permissions\``);
  }
}
