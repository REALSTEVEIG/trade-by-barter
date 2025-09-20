"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsModule = void 0;
const common_1 = require("@nestjs/common");
const listings_controller_1 = require("./listings.controller");
const listings_service_1 = require("./listings.service");
const upload_service_1 = require("./upload.service");
const aws_s3_service_1 = require("./aws-s3.service");
const prisma_module_1 = require("../prisma/prisma.module");
let ListingsModule = class ListingsModule {
};
exports.ListingsModule = ListingsModule;
exports.ListingsModule = ListingsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [listings_controller_1.ListingsController],
        providers: [listings_service_1.ListingsService, upload_service_1.UploadService, aws_s3_service_1.AwsS3Service],
        exports: [listings_service_1.ListingsService, upload_service_1.UploadService],
    })
], ListingsModule);
//# sourceMappingURL=listings.module.js.map