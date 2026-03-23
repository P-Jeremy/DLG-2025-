export interface IEmailService {
  sendActivationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
  sendNewSongNotification(to: string, songTitle: string): Promise<void>;
}
