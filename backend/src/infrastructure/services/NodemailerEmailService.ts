import nodemailer from 'nodemailer';
import type { IEmailService } from '../../domain/interfaces/IEmailService';

const IS_TEST_ENVIRONMENT = process.env.NODE_ENV === 'test';

export class NodemailerEmailService implements IEmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly senderEmail: string;
  private readonly clientUrl: string;

  constructor() {
    this.senderEmail = process.env.EMAIL ?? '';
    this.clientUrl = process.env.CLIENT_URL ?? '';

    if (IS_TEST_ENVIRONMENT) {
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    } else {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.senderEmail,
          pass: process.env.GMAIL_PASS,
        },
      });
    }
  }

  async sendActivationEmail(to: string, token: string): Promise<void> {
    const activationLink = `${this.clientUrl}/activate/${token}`;
    await this.transporter.sendMail({
      from: this.senderEmail,
      to,
      subject: 'Validation inscription',
      html: `<p>Cliquez sur le lien pour activer votre compte : <a href="${activationLink}">${activationLink}</a></p>`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetLink = `${this.clientUrl}/reset-password/${token}`;
    await this.transporter.sendMail({
      from: this.senderEmail,
      to,
      subject: 'Réinitialisation mot de passe',
      html: `<p>Cliquez sur le lien pour réinitialiser votre mot de passe : <a href="${resetLink}">${resetLink}</a></p>`,
    });
  }

  async sendNewSongNotification(to: string, songTitle: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.senderEmail,
      to,
      subject: 'Nouvelle chanson ajoutée',
      html: `<p>Une nouvelle chanson a été ajoutée : <strong>${songTitle}</strong></p>`,
    });
  }
}
