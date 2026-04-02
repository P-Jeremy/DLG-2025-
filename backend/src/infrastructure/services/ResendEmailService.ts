import { Resend } from 'resend';
import type { IEmailService } from '../../application/interfaces/IEmailService';

function dlgEmailTemplate(content: string): string {
  return `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
      <div style="background:#990000;padding:24px 32px;">
        <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:1px;">Dans le Garage</span>
      </div>
      <div style="padding:32px;color:#213547;line-height:1.7;">
        ${content}
      </div>
      <div style="padding:16px 32px;background:#fde8e8;text-align:center;font-size:12px;color:#7a0000;">
        Dans le Garage — musique en famille 🎸
      </div>
    </div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export class ResendEmailService implements IEmailService {
  private get resendClient(): Resend {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY environment variable is not set');
    return new Resend(apiKey);
  }

  private get fromEmail(): string {
    return process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  }

  private get clientUrl(): string {
    const url = process.env.CLIENT_URL;
    if (!url) throw new Error('CLIENT_URL environment variable is not set');
    return url;
  }

  async sendActivationEmail(to: string, token: string): Promise<void> {
    const activationLink = `${this.clientUrl}/activate/${escapeHtml(token)}`;
    await this.resendClient.emails.send({
      from: this.fromEmail,
      to,
      subject: 'DLG - Validation inscription',
      text: `Ami garagiste,\n\nPour activer ton compte, clique sur le lien ci-dessous :\n${activationLink}\n\n— Dans le Garage`,
      html: dlgEmailTemplate(`<p>Ami garagiste, 🎵</p><p>Pour activer ton compte, clique sur le lien ci-dessous :</p><p><a href="${activationLink}" style="color:#990000;font-weight:bold;">${activationLink}</a></p>`),
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetLink = `${this.clientUrl}/reset-password/${escapeHtml(token)}`;
    await this.resendClient.emails.send({
      from: this.fromEmail,
      to,
      subject: 'DLG - Réinitialisation mot de passe',
      text: `Ami garagiste,\n\nTu as demandé à réinitialiser ton mot de passe. Clique sur le lien ci-dessous :\n${resetLink}\n\n— Dans le Garage`,
      html: dlgEmailTemplate(`<p>Ami garagiste, 🎵</p><p>Tu as demandé à réinitialiser ton mot de passe. Clique sur le lien ci-dessous :</p><p><a href="${resetLink}" style="color:#990000;font-weight:bold;">${resetLink}</a></p>`),
    });
  }

  async sendNewSongNotification(to: string, songTitle: string): Promise<void> {
    await this.resendClient.emails.send({
      from: this.fromEmail,
      to,
      subject: 'DLG - Nouvelle chanson ajoutée',
      text: `Ami garagiste,\n\nUne nouvelle chanson vient d'être ajoutée au répertoire : ${songTitle}\n\n— Dans le Garage`,
      html: dlgEmailTemplate(`<p>Ami garagiste, 🎵</p><p>Une nouvelle chanson vient d'être ajoutée au répertoire : <strong>${escapeHtml(songTitle)}</strong></p>`),
    });
  }
}
