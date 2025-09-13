import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// Custom decorator to validate Nigerian phone numbers
export function IsNigerianPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNigerianPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          // Nigerian phone number patterns: +234, 0234, 234, or local format
          const phoneRegex = /^(\+?234|0)?[789][01]\d{8}$/;
          return typeof value === 'string' && phoneRegex.test(value.replace(/\s+/g, ''));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Nigerian phone number`;
        },
      },
    });
  };
}

// Custom decorator to validate Nigerian bank account numbers
export function IsNigerianBankAccount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNigerianBankAccount',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          // Nigerian bank account numbers are typically 10 digits
          const accountRegex = /^\d{10}$/;
          return typeof value === 'string' && accountRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid 10-digit Nigerian bank account number`;
        },
      },
    });
  };
}

// Custom decorator to validate Nigerian bank codes
export function IsNigerianBankCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNigerianBankCode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          // Nigerian bank codes are typically 3 digits
          const codeRegex = /^\d{3}$/;
          return typeof value === 'string' && codeRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid 3-digit Nigerian bank code`;
        },
      },
    });
  };
}

// Custom decorator to validate amounts in kobo (must be positive integers)
export function IsAmountInKobo(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAmountInKobo',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null) return false;
          return Number.isInteger(value) && value > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a positive integer representing amount in kobo`;
        },
      },
    });
  };
}

// Custom decorator to validate minimum amount
export function IsMinimumAmount(minAmount: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMinimumAmount',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minAmount],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [minAmount] = args.constraints;
          return Number.isInteger(value) && value >= minAmount;
        },
        defaultMessage(args: ValidationArguments) {
          const [minAmount] = args.constraints;
          const minInNaira = (minAmount / 100).toFixed(2);
          return `${args.property} must be at least ₦${minInNaira} (${minAmount} kobo)`;
        },
      },
    });
  };
}

// Custom decorator to validate maximum amount
export function IsMaximumAmount(maxAmount: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMaximumAmount',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxAmount],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [maxAmount] = args.constraints;
          return Number.isInteger(value) && value <= maxAmount;
        },
        defaultMessage(args: ValidationArguments) {
          const [maxAmount] = args.constraints;
          const maxInNaira = (maxAmount / 100).toFixed(2);
          return `${args.property} must not exceed ₦${maxInNaira} (${maxAmount} kobo)`;
        },
      },
    });
  };
}

// Custom decorator to validate UUID format
export function IsValidUUID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidUUID',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return typeof value === 'string' && uuidRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid UUID`;
        },
      },
    });
  };
}

// Custom parameter decorator to extract and validate user ID from JWT
export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.id) {
      throw new BadRequestException('User ID not found in request');
    }
    
    return user.id;
  },
);

// Custom parameter decorator to extract user with validation
export const GetValidatedUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new BadRequestException('User not found in request');
    }
    
    return data ? user[data] : user;
  },
);