import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';
import type { IFileUploadService, UploadableFile } from '../../application/interfaces/IFileUploadService';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export class S3FileUploadService implements IFileUploadService {
  private get s3Client(): S3Client {
    return new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  private get bucketName(): string {
    return process.env.AWS_S3_BUCKET ?? '';
  }

  async upload(file: UploadableFile): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only PNG and JPG images are allowed.');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('File too large. Maximum size is 2MB.');
    }

    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    const key = `${randomUUID()}${extension}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async delete(url: string): Promise<void> {
    const bucketPrefix = `https://${this.bucketName}.s3.amazonaws.com/`;
    if (!url.startsWith(bucketPrefix)) return;

    const key = url.slice(bucketPrefix.length);

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }
}
