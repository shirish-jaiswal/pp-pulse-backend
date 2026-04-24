import { UserManagementRepository } from './user-management.repository';
export declare class UserManagementService {
    private readonly repository;
    constructor(repository: UserManagementRepository);
    findByEmail(email: string): Promise<{
        success: boolean;
        api: string;
        count: number;
        data: import("./user-management.types").PortalUserLookup[];
    }>;
}
