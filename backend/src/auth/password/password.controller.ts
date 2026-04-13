import { Controller, Post, Body } from '@nestjs/common';
import { PasswordService } from './password.service';

@Controller('auth/password')
export class PasswordController {
  constructor(private passwordService: PasswordService) {}

  @Post('request')
  async request(@Body('email') email: string) {
    return this.passwordService.requestReset(email);
  }

  @Post('reset')
  async reset(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.passwordService.resetPassword(token, password);
  }
}
