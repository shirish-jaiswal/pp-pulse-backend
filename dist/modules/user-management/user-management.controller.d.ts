import { UserManagementRepository } from './user-management.repository';
export declare class UserManagementController {
    private readonly repo;
    constructor(repo: UserManagementRepository);
    getUser(emailAddress: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("./user-management.types").PortalUserLookup | null;
        message?: undefined;
    }>;
}
