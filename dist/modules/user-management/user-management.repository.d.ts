import { DatabaseService } from '../../database/database.service';
import { PortalUserLookup } from './user-management.types';
export declare class UserManagementRepository {
    private readonly database;
    constructor(database: DatabaseService);
    findUser(emailAddress?: string, userId?: string): Promise<PortalUserLookup | null>;
    findByEmail(emailAddress: string): Promise<PortalUserLookup | null>;
    findByUserId(userId: string): Promise<PortalUserLookup | null>;
    findByUserIdAndEmail(userId: string, emailAddress: string): Promise<PortalUserLookup | null>;
}
