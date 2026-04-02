import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';
import type { IFileUploadService, UploadableFile } from '../../application/interfaces/IFileUploadService';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export class S3FileUploadService implements IFileUploadService {
  private get s3Client(): S3Client {
    const accessKeyId = process.env.AWS_ID;
    const secretAccessKey = process.env.AWS_KEY;
    if (!accessKeyId) throw new Error('AWS_ID environment variable is not set');
    if (!secretAccessKey) throw new Error('AWS_KEY environment variable is not set');
    return new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  private get bucketName(): string {
    const bucket = process.env.BUCKET;
    if (!bucket) throw new Error('BUCKET environment variable is not set');
    return bucket;
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
    if (!/^[0-9a-f-]{36}\.(jpg|jpeg|png)$/i.test(key)) return;

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }
}
