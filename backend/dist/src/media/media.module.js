"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const prisma_module_1 = require("../prisma/prisma.module");
const media_controller_1 = require("./media.controller");
const media_service_1 = require("./services/media.service");
const local_storage_provider_1 = require("./storage/local-storage.provider");
const s3_storage_provider_1 = require("./storage/s3-storage.provider");
const storage_provider_factory_1 = require("./storage/storage-provider.factory");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            prisma_module_1.PrismaModule,
            platform_express_1.MulterModule.register({
                dest: './uploads/temp',
                limits: {
                    fileSize: 100 * 1024 * 1024,
                    files: 10,
                },
            }),
        ],
        controllers: [media_controller_1.MediaController],
        providers: [
            media_service_1.MediaService,
            local_storage_provider_1.LocalStorageProvider,
            s3_storage_provider_1.S3StorageProvider,
            storage_provider_factory_1.StorageProviderFactory,
        ],
        exports: [
            media_service_1.MediaService,
            storage_provider_factory_1.StorageProviderFactory,
            local_storage_provider_1.LocalStorageProvider,
            s3_storage_provider_1.S3StorageProvider,
        ],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map