import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class InputSanitizationPipe implements PipeTransform<any> {
    transform(value: any, { metatype }: ArgumentMetadata): Promise<any>;
    private toValidate;
    private sanitizeInput;
    private sanitizeString;
}
