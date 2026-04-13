import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendInvitation(email: string, familyName: string, token: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Undangan Bergabung Keluarga ${familyName} - Yumna`,
      template: './invitation',
      context: {
        familyName,
        token,
      },
    });
  }

  async sendPasswordReset(email: string, token: string) {
    // Scaffold for password reset email if needed later
    console.log(`[MAIL] Sending password reset to ${email} with token ${token}`);
  }
}
