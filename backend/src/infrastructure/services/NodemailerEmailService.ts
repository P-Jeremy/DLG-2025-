import nodemailer from 'nodemailer';
import type { IEmailService } from '../../domain/interfaces/IEmailService';

const IS_TEST_ENVIRONMENT = process.env.NODE_ENV === 'test';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export class NodemailerEmailService implements IEmailService {
  private get transporter(): nodemailer.Transporter {
    if (IS_TEST_ENVIRONMENT) {
      return nodemailer.createTransport({ jsonTransport: true });
    }
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  private get senderEmail(): string {
    return process.env.EMAIL ?? '';
  }

  private get clientUrl(): string {
    return process.env.CLIENT_URL ?? '';
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
      html: `<p>Une nouvelle chanson a été ajoutée : <strong>${escapeHtml(songTitle)}</strong></p>`,
    });
  }
}
