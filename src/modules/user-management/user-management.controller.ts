import { Controller, Get, Query } from '@nestjs/common';
import { UserManagementRepository } from './user-management.repository';

@Controller('user-management')
export class UserManagementController {
  constructor(private readonly repo: UserManagementRepository) {}

  @Get()
  async getUser(@Query('emailAddress') emailAddress: string) {
    if (!emailAddress || !emailAddress.trim()) {
      return {
        success: false,
        message: 'emailAddress is required',
      };
    }

    const data = await this.repo.findByEmail(emailAddress);

    return {
      success: true,
      data: data || null,
    };
  }
}