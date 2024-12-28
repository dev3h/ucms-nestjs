import { MigrationInterface, QueryRunner } from "typeorm";

export class UcmsMigration1735379030778 implements MigrationInterface {
    name = 'UcmsMigration1735379030778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_has_permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`is_direct\` tinyint NOT NULL DEFAULT 0, \`status\` tinyint NULL COMMENT '1 = added, 2 = ignored, NULL = inherited from role', \`user_id\` int NULL, \`permission_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`description\` text NULL, \`code\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`actions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`modules\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subsystems\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`system_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`system_client_secrets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`client_secret\` varchar(255) NOT NULL, \`is_enabled\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`system_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`systems\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`client_id\` varchar(255) NOT NULL, \`redirect_uris\` json NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`system_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`access_token\` varchar(255) NOT NULL, \`refresh_token\` varchar(255) NOT NULL, \`expires_at\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`userId\` int NULL, \`systemId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`device_sessions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`device_id\` text NOT NULL, \`name\` text NOT NULL, \`ua\` text NOT NULL, \`secret_key\` text NOT NULL, \`refresh_token\` text NULL, \`expired_at\` timestamp NOT NULL, \`ip_address\` varchar(255) NOT NULL, \`device_type\` tinyint NOT NULL COMMENT '1: Web, 2: Mobile,3: Unknown' DEFAULT '1', \`os\` varchar(255) NOT NULL DEFAULT 'Unknown', \`browser\` varchar(255) NOT NULL DEFAULT 'Unknown', \`session_type\` tinyint NOT NULL COMMENT '1: Dashboard Admin, 2: SSO System' DEFAULT '1', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`level\` tinyint NOT NULL COMMENT '0: debug, 1: info, 2: warning, 3: error, 4: critical', \`message\` text NOT NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`module\` varchar(255) NULL, \`function_name\` varchar(255) NULL, \`status_code\` int NULL, \`ip_address\` varchar(45) NULL, \`geo_location\` json NULL, \`user_agent\` text NULL, \`stack_trace\` text NULL, \`additional_data\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`type\` tinyint NOT NULL COMMENT '1: Admin, 2: User', \`password\` varchar(255) NOT NULL, \`phone_number\` varchar(255) NOT NULL, \`is_change_password_first\` tinyint NOT NULL DEFAULT 0, \`status\` tinyint NOT NULL COMMENT '1: Active, 2: Suspend, 3: DeActive' DEFAULT '1', \`token_first_time\` varchar(255) NULL, \`two_factor_secret\` varchar(255) NULL, \`two_factor_recovery_code\` varchar(255) NULL, \`two_factor_enable\` tinyint NOT NULL DEFAULT 0, \`two_factor_confirmed_at\` datetime NULL, \`access_token\` varchar(255) NULL, \`refresh_token\` varchar(255) NULL, \`last_login_at\` datetime NULL, \`failed_login_count\` int NOT NULL DEFAULT '0', \`is_blocked\` tinyint NOT NULL DEFAULT 0, \`blocked_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`password_updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_login_histories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`device_id\` varchar(255) NOT NULL, \`last_login\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`token\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`password_reset_tokens\` (\`email\` varchar(255) NOT NULL, \`token\` varchar(255) NOT NULL, \`otp_code\` varchar(255) NULL, \`phone_number\` varchar(255) NULL, PRIMARY KEY (\`email\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`device_login_histories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`account_identifier\` varchar(255) NOT NULL, \`device_identifier\` varchar(255) NOT NULL, \`last_login_at\` timestamp NOT NULL, \`session_token\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_has_permissions\` (\`role_id\` int NOT NULL, \`permission_id\` int NOT NULL, INDEX \`IDX_9135e97d2d840f7dfd6e664911\` (\`role_id\`), INDEX \`IDX_09ff9df62bd01f8cf45b1b1921\` (\`permission_id\`), PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`modules_actions\` (\`module_id\` int NOT NULL, \`action_id\` int NOT NULL, INDEX \`IDX_18cc034d2c9c557ef540b58fb0\` (\`module_id\`), INDEX \`IDX_4faae5ce69e66713f6db711de2\` (\`action_id\`), PRIMARY KEY (\`module_id\`, \`action_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subsystems_modules\` (\`subsystem_id\` int NOT NULL, \`module_id\` int NOT NULL, INDEX \`IDX_d010bec6f96205d03cd8b783bb\` (\`subsystem_id\`), INDEX \`IDX_18ef483e5bb544d0bf59fd544b\` (\`module_id\`), PRIMARY KEY (\`subsystem_id\`, \`module_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_has_roles\` (\`user_id\` int NOT NULL, \`role_id\` int NOT NULL, INDEX \`IDX_d2b980baf026ff8347d88ace6e\` (\`user_id\`), INDEX \`IDX_386dc0042695c976845d36be94\` (\`role_id\`), PRIMARY KEY (\`user_id\`, \`role_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_has_permissions\` ADD CONSTRAINT \`FK_338fbd9e726c66cd65176cb8512\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_has_permissions\` ADD CONSTRAINT \`FK_6c3e7c9682a0bd4879c475e5df6\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`subsystems\` ADD CONSTRAINT \`FK_84d896fd64dc0971dd15a904809\` FOREIGN KEY (\`system_id\`) REFERENCES \`systems\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`system_client_secrets\` ADD CONSTRAINT \`FK_7e52d24092b38ba749cb36b3cc8\` FOREIGN KEY (\`system_id\`) REFERENCES \`systems\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`system_tokens\` ADD CONSTRAINT \`FK_f72ab44d4e92527a6f732da9456\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`system_tokens\` ADD CONSTRAINT \`FK_16c09aed8010a9feb48305f9f6d\` FOREIGN KEY (\`systemId\`) REFERENCES \`systems\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_sessions\` ADD CONSTRAINT \`FK_25bdb865453f3684db291e1436f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD CONSTRAINT \`FK_70c2c3d40d9f661ac502de51349\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_login_histories\` ADD CONSTRAINT \`FK_e26d65d603125818a6bc193a015\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_login_histories\` ADD CONSTRAINT \`FK_c52ef2b8d04228d828def11e865\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_has_permissions\` ADD CONSTRAINT \`FK_9135e97d2d840f7dfd6e6649116\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_has_permissions\` ADD CONSTRAINT \`FK_09ff9df62bd01f8cf45b1b1921a\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`modules_actions\` ADD CONSTRAINT \`FK_18cc034d2c9c557ef540b58fb05\` FOREIGN KEY (\`module_id\`) REFERENCES \`modules\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`modules_actions\` ADD CONSTRAINT \`FK_4faae5ce69e66713f6db711de24\` FOREIGN KEY (\`action_id\`) REFERENCES \`actions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`subsystems_modules\` ADD CONSTRAINT \`FK_d010bec6f96205d03cd8b783bb6\` FOREIGN KEY (\`subsystem_id\`) REFERENCES \`subsystems\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`subsystems_modules\` ADD CONSTRAINT \`FK_18ef483e5bb544d0bf59fd544b9\` FOREIGN KEY (\`module_id\`) REFERENCES \`modules\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_has_roles\` ADD CONSTRAINT \`FK_d2b980baf026ff8347d88ace6ee\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_has_roles\` ADD CONSTRAINT \`FK_386dc0042695c976845d36be948\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_has_roles\` DROP FOREIGN KEY \`FK_386dc0042695c976845d36be948\``);
        await queryRunner.query(`ALTER TABLE \`user_has_roles\` DROP FOREIGN KEY \`FK_d2b980baf026ff8347d88ace6ee\``);
        await queryRunner.query(`ALTER TABLE \`subsystems_modules\` DROP FOREIGN KEY \`FK_18ef483e5bb544d0bf59fd544b9\``);
        await queryRunner.query(`ALTER TABLE \`subsystems_modules\` DROP FOREIGN KEY \`FK_d010bec6f96205d03cd8b783bb6\``);
        await queryRunner.query(`ALTER TABLE \`modules_actions\` DROP FOREIGN KEY \`FK_4faae5ce69e66713f6db711de24\``);
        await queryRunner.query(`ALTER TABLE \`modules_actions\` DROP FOREIGN KEY \`FK_18cc034d2c9c557ef540b58fb05\``);
        await queryRunner.query(`ALTER TABLE \`role_has_permissions\` DROP FOREIGN KEY \`FK_09ff9df62bd01f8cf45b1b1921a\``);
        await queryRunner.query(`ALTER TABLE \`role_has_permissions\` DROP FOREIGN KEY \`FK_9135e97d2d840f7dfd6e6649116\``);
        await queryRunner.query(`ALTER TABLE \`device_login_histories\` DROP FOREIGN KEY \`FK_c52ef2b8d04228d828def11e865\``);
        await queryRunner.query(`ALTER TABLE \`user_login_histories\` DROP FOREIGN KEY \`FK_e26d65d603125818a6bc193a015\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP FOREIGN KEY \`FK_70c2c3d40d9f661ac502de51349\``);
        await queryRunner.query(`ALTER TABLE \`device_sessions\` DROP FOREIGN KEY \`FK_25bdb865453f3684db291e1436f\``);
        await queryRunner.query(`ALTER TABLE \`system_tokens\` DROP FOREIGN KEY \`FK_16c09aed8010a9feb48305f9f6d\``);
        await queryRunner.query(`ALTER TABLE \`system_tokens\` DROP FOREIGN KEY \`FK_f72ab44d4e92527a6f732da9456\``);
        await queryRunner.query(`ALTER TABLE \`system_client_secrets\` DROP FOREIGN KEY \`FK_7e52d24092b38ba749cb36b3cc8\``);
        await queryRunner.query(`ALTER TABLE \`subsystems\` DROP FOREIGN KEY \`FK_84d896fd64dc0971dd15a904809\``);
        await queryRunner.query(`ALTER TABLE \`user_has_permissions\` DROP FOREIGN KEY \`FK_6c3e7c9682a0bd4879c475e5df6\``);
        await queryRunner.query(`ALTER TABLE \`user_has_permissions\` DROP FOREIGN KEY \`FK_338fbd9e726c66cd65176cb8512\``);
        await queryRunner.query(`DROP INDEX \`IDX_386dc0042695c976845d36be94\` ON \`user_has_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_d2b980baf026ff8347d88ace6e\` ON \`user_has_roles\``);
        await queryRunner.query(`DROP TABLE \`user_has_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_18ef483e5bb544d0bf59fd544b\` ON \`subsystems_modules\``);
        await queryRunner.query(`DROP INDEX \`IDX_d010bec6f96205d03cd8b783bb\` ON \`subsystems_modules\``);
        await queryRunner.query(`DROP TABLE \`subsystems_modules\``);
        await queryRunner.query(`DROP INDEX \`IDX_4faae5ce69e66713f6db711de2\` ON \`modules_actions\``);
        await queryRunner.query(`DROP INDEX \`IDX_18cc034d2c9c557ef540b58fb0\` ON \`modules_actions\``);
        await queryRunner.query(`DROP TABLE \`modules_actions\``);
        await queryRunner.query(`DROP INDEX \`IDX_09ff9df62bd01f8cf45b1b1921\` ON \`role_has_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_9135e97d2d840f7dfd6e664911\` ON \`role_has_permissions\``);
        await queryRunner.query(`DROP TABLE \`role_has_permissions\``);
        await queryRunner.query(`DROP TABLE \`device_login_histories\``);
        await queryRunner.query(`DROP TABLE \`password_reset_tokens\``);
        await queryRunner.query(`DROP TABLE \`user_login_histories\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`logs\``);
        await queryRunner.query(`DROP TABLE \`device_sessions\``);
        await queryRunner.query(`DROP TABLE \`system_tokens\``);
        await queryRunner.query(`DROP TABLE \`systems\``);
        await queryRunner.query(`DROP TABLE \`system_client_secrets\``);
        await queryRunner.query(`DROP TABLE \`subsystems\``);
        await queryRunner.query(`DROP TABLE \`modules\``);
        await queryRunner.query(`DROP TABLE \`actions\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP TABLE \`user_has_permissions\``);
    }

}
