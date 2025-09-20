import { ConfigService } from '@nestjs/config';
export declare class AwsS3Service {
    private readonly configService;
    private readonly logger;
    private readonly s3;
    private readonly bucketName;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        key: string;
        url: string;
        filename: string;
    }>;
    deleteFile(key: string): Promise<boolean>;
    getFileUrl(key: string): string;
}
