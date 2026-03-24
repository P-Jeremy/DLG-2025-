export interface UploadableFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface IFileUploadService {
  upload(file: UploadableFile): Promise<string>;
}
