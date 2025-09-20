import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly s3: S3;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'eu-north-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY', '');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME', 'tradebybarter');

    this.s3 = new S3({
      region,
      accessKeyId,
      secretAccessKey,
    });

    this.logger.log(`S3 Service initialized for bucket: ${this.bucketName} in region: ${region}`);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'listings'
  ): Promise<{
    key: string;
    url: string;
    filename: string;
  }> {
    try {
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const key = `${folder}/${filename}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Note: ACL removed as bucket doesn't allow ACLs
        // Access will be managed through bucket policy
      };

      this.logger.log(`Uploading file to S3: ${key}`);
      
      const result = await this.s3.upload(uploadParams).promise();
      
      this.logger.log(`File uploaded successfully: ${result.Location}`);

      return {
        key,
        url: result.Location,
        filename,
      };
    } catch (error) {
      this.logger.error(`S3 upload failed: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key,
      }).promise();

      this.logger.log(`File deleted from S3: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`S3 delete failed: ${error.message}`, error.stack);
      return false;
    }
  }

  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
  }
}