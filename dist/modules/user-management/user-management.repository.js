"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementRepository = void 0;
const common_1 = require("@nestjs/common");
const sql = require("mssql");
const database_service_1 = require("../../database/database.service");
let UserManagementRepository = class UserManagementRepository {
    constructor(database) {
        this.database = database;
    }
    async findUser(emailAddress, userId) {
        const schema = this.database.schema;
        const normalizedEmail = (emailAddress ?? '').trim();
        const normalizedUserId = (userId ?? '').trim();
        if (!normalizedEmail && !normalizedUserId) {
            return null;
        }
        const result = await this.database.query((request) => request
            .input('email_address', sql.VarChar(100), normalizedEmail === '' ? null : normalizedEmail)
            .input('user_id', sql.VarChar(100), normalizedUserId === '' ? null : normalizedUserId), `
      IF OBJECT_ID('${schema}.casinouser') IS NULL
         OR OBJECT_ID('${schema}.casino') IS NULL
         OR OBJECT_ID('${schema}.OneWalletCasino') IS NULL
         OR OBJECT_ID('${schema}.Environment') IS NULL
         OR OBJECT_ID('${schema}.usernote') IS NULL
         OR OBJECT_ID('${schema}.ScreenNameUpdateCounter') IS NULL
      BEGIN
        SELECT
          CAST(NULL AS VARCHAR(100)) AS userId,
          CAST(NULL AS VARCHAR(100)) AS emailAddress,
          CAST(NULL AS VARCHAR(200)) AS screenName,
          CAST(NULL AS INT) AS chatAllowedFlag,
          CAST(NULL AS VARCHAR(1000)) AS chatBlockedComments,
          CAST(NULL AS VARCHAR(100)) AS casinoId,
          CAST(NULL AS VARCHAR(255)) AS casinoName,
          CAST(NULL AS VARCHAR(255)) AS className,
          CAST(NULL AS VARCHAR(100)) AS env,
          CAST(NULL AS VARCHAR(255)) AS environmentName,
          CAST(NULL AS NVARCHAR(200)) AS nickName,
          CAST(NULL AS INT) AS screenNameUpdateCount,
          'Required table not found' AS status;
        RETURN;
      END;

      SELECT TOP 1
         TRY_CONVERT(VARCHAR(100), cu.user_id) AS userId
        ,TRY_CONVERT(VARCHAR(100), cu.email_address) AS emailAddress
        ,TRY_CONVERT(VARCHAR(200), cu.screen_name) AS screenName
        ,cu.chat_allowed_flag AS chatAllowedFlag
        ,un.note AS chatBlockedComments
        ,TRY_CONVERT(VARCHAR(100), c.casino_id) AS casinoId
        ,RTRIM(TRY_CONVERT(VARCHAR(255), c.casino_desc)) AS casinoName
        ,TRY_CONVERT(VARCHAR(255), owc.class_name) AS className
        ,TRY_CONVERT(VARCHAR(100), owc.env) AS env
        ,RTRIM(TRY_CONVERT(VARCHAR(255), e.name)) AS environmentName
        ,cu.screen_name_unicode AS nickName
        ,ISNULL(sn.update_count, 0) AS screenNameUpdateCount
        ,'FOUND' AS status
      FROM ${schema}.casinouser cu WITH (NOLOCK)
      INNER JOIN ${schema}.casino c WITH (NOLOCK)
        ON c.casino_id = cu.casino_id
      INNER JOIN ${schema}.OneWalletCasino owc WITH (NOLOCK)
        ON owc.casino_id = cu.casino_id
      INNER JOIN ${schema}.Environment e WITH (NOLOCK)
        ON e.env_id = owc.env
      LEFT JOIN ${schema}.usernote un WITH (NOLOCK)
        ON un.user_id = cu.user_id
      LEFT JOIN ${schema}.ScreenNameUpdateCounter sn WITH (NOLOCK)
        ON sn.user_id = cu.user_id
      WHERE
        (@user_id IS NULL OR TRY_CONVERT(VARCHAR(100), cu.user_id) = @user_id)
        AND
        (@email_address IS NULL OR TRY_CONVERT(VARCHAR(100), cu.email_address) = @email_address)
      ORDER BY c.casino_id;
      `);
        return result.recordset?.[0] ?? null;
    }
    async findByEmail(emailAddress) {
        return this.findUser(emailAddress, undefined);
    }
    async findByUserId(userId) {
        return this.findUser(undefined, userId);
    }
    async findByUserIdAndEmail(userId, emailAddress) {
        return this.findUser(emailAddress, userId);
    }
};
exports.UserManagementRepository = UserManagementRepository;
exports.UserManagementRepository = UserManagementRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UserManagementRepository);
//# sourceMappingURL=user-management.repository.js.map