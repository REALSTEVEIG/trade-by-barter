"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetValidatedUser = exports.GetUserId = void 0;
exports.IsNigerianPhone = IsNigerianPhone;
exports.IsNigerianBankAccount = IsNigerianBankAccount;
exports.IsNigerianBankCode = IsNigerianBankCode;
exports.IsAmountInKobo = IsAmountInKobo;
exports.IsMinimumAmount = IsMinimumAmount;
exports.IsMaximumAmount = IsMaximumAmount;
exports.IsValidUUID = IsValidUUID;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
function IsNigerianPhone(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isNigerianPhone',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (!value)
                        return false;
                    const phoneRegex = /^(\+?234|0)?[789][01]\d{8}$/;
                    return typeof value === 'string' && phoneRegex.test(value.replace(/\s+/g, ''));
                },
                defaultMessage(args) {
                    return `${args.property} must be a valid Nigerian phone number`;
                },
            },
        });
    };
}
function IsNigerianBankAccount(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isNigerianBankAccount',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (!value)
                        return false;
                    const accountRegex = /^\d{10}$/;
                    return typeof value === 'string' && accountRegex.test(value);
                },
                defaultMessage(args) {
                    return `${args.property} must be a valid 10-digit Nigerian bank account number`;
                },
            },
        });
    };
}
function IsNigerianBankCode(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isNigerianBankCode',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (!value)
                        return false;
                    const codeRegex = /^\d{3}$/;
                    return typeof value === 'string' && codeRegex.test(value);
                },
                defaultMessage(args) {
                    return `${args.property} must be a valid 3-digit Nigerian bank code`;
                },
            },
        });
    };
}
function IsAmountInKobo(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isAmountInKobo',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (value === undefined || value === null)
                        return false;
                    return Number.isInteger(value) && value > 0;
                },
                defaultMessage(args) {
                    return `${args.property} must be a positive integer representing amount in kobo`;
                },
            },
        });
    };
}
function IsMinimumAmount(minAmount, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isMinimumAmount',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [minAmount],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const [minAmount] = args.constraints;
                    return Number.isInteger(value) && value >= minAmount;
                },
                defaultMessage(args) {
                    const [minAmount] = args.constraints;
                    const minInNaira = (minAmount / 100).toFixed(2);
                    return `${args.property} must be at least ₦${minInNaira} (${minAmount} kobo)`;
                },
            },
        });
    };
}
function IsMaximumAmount(maxAmount, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isMaximumAmount',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [maxAmount],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const [maxAmount] = args.constraints;
                    return Number.isInteger(value) && value <= maxAmount;
                },
                defaultMessage(args) {
                    const [maxAmount] = args.constraints;
                    const maxInNaira = (maxAmount / 100).toFixed(2);
                    return `${args.property} must not exceed ₦${maxInNaira} (${maxAmount} kobo)`;
                },
            },
        });
    };
}
function IsValidUUID(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isValidUUID',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (!value)
                        return false;
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                    return typeof value === 'string' && uuidRegex.test(value);
                },
                defaultMessage(args) {
                    return `${args.property} must be a valid UUID`;
                },
            },
        });
    };
}
exports.GetUserId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) {
        throw new common_1.BadRequestException('User ID not found in request');
    }
    return user.id;
});
exports.GetValidatedUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
        throw new common_1.BadRequestException('User not found in request');
    }
    return data ? user[data] : user;
});
//# sourceMappingURL=validation.decorators.js.map