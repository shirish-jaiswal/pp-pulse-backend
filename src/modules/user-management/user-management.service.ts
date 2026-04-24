import { Injectable } from '@nestjs/common';
import { UserManagementRepository } from './user-management.repository';

@Injectable()
export class UserManagementService {
  constructor(private readonly repository: UserManagementRepository) {}

  async findByEmail(email: string) {
    const row = await this.repository.findByEmail(email);

    return {
      success: true,
      api: 'user-management/search',
      count: row ? 1 : 0,
      data: row ? [row] : [],
    };
  }
}
