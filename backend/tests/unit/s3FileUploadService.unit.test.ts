import { S3FileUploadService } from '../../src/infrastructure/services/S3FileUploadService';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { UploadableFile } from '../../src/application/interfaces/IFileUploadService';

const mockSend = jest.fn().mockResolvedValue({});

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn().mockImplementation((input) => input),
  DeleteObjectCommand: jest.fn().mockImplementation((input) => input),
}));

const validFile: UploadableFile = {
  originalname: 'cover.jpg',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('fake-image'),
  size: 1024,
};

describe('S3FileUploadService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      BUCKET: 'test-bucket',
      AWS_ID: 'test-key-id',
      AWS_KEY: 'test-secret',
    };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const service = new S3FileUploadService();

  describe('upload', () => {
    it('should return a public S3 URL after uploading a valid file', async () => {
      const url = await service.upload(validFile);

      expect(url).toMatch(/^https:\/\/test-bucket\.s3\.amazonaws\.com\/.+\.jpg$/);
    });

    it('should call S3 send with the file content and correct bucket', async () => {
      await service.upload(validFile);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = (PutObjectCommand as unknown as jest.Mock).mock.calls[0][0];
      expect(command.Bucket).toBe('test-bucket');
      expect(command.ContentType).toBe('image/jpeg');
      expect(command.ACL).toBe('public-read');
    });

    it('should throw when the MIME type is not allowed', async () => {
      const file: UploadableFile = { ...validFile, mimetype: 'application/pdf' };

      await expect(service.upload(file)).rejects.toThrow('Invalid file type');
    });

    it('should throw when the file exceeds 2MB', async () => {
      const file: UploadableFile = { ...validFile, size: 3 * 1024 * 1024 };

      await expect(service.upload(file)).rejects.toThrow('File too large');
    });

    it('should accept png MIME type', async () => {
      const pngFile: UploadableFile = { ...validFile, mimetype: 'image/png', originalname: 'img.png' };

      await expect(service.upload(pngFile)).resolves.toMatch(/\.png$/);
    });
  });

  describe('delete', () => {
    it('should call S3 DeleteObjectCommand with the extracted key', async () => {
      const url = 'https://test-bucket.s3.amazonaws.com/550e8400-e29b-41d4-a716-446655440000.jpg';

      await service.delete(url);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = (DeleteObjectCommand as unknown as jest.Mock).mock.calls[0][0];
      expect(command.Bucket).toBe('test-bucket');
      expect(command.Key).toBe('550e8400-e29b-41d4-a716-446655440000.jpg');
    });

    it('should do nothing when the URL does not belong to the bucket', async () => {
      await service.delete('https://other-bucket.s3.amazonaws.com/file.jpg');

      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});
