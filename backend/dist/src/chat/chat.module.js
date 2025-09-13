"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const chat_gateway_1 = require("./chat.gateway");
const cache_service_1 = require("./cache.service");
const prisma_module_1 = require("../prisma/prisma.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    storage: (0, multer_1.diskStorage)({
                        destination: './uploads/chat',
                        filename: (req, file, callback) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                            const extension = (0, path_1.extname)(file.originalname);
                            const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
                            callback(null, filename);
                        },
                    }),
                    limits: {
                        fileSize: 50 * 1024 * 1024,
                    },
                    fileFilter: (req, file, callback) => {
                        const allowedMimes = [
                            'image/jpeg',
                            'image/jpg',
                            'image/png',
                            'image/gif',
                            'image/webp',
                            'application/pdf',
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'text/plain',
                            'audio/mpeg',
                            'audio/mp3',
                            'audio/wav',
                            'audio/ogg',
                            'audio/m4a',
                            'video/mp4',
                            'video/webm',
                        ];
                        if (allowedMimes.includes(file.mimetype)) {
                            callback(null, true);
                        }
                        else {
                            callback(new Error(`File type ${file.mimetype} not supported for chat messages`), false);
                        }
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_service_1.ChatService, chat_gateway_1.ChatGateway, cache_service_1.ChatCacheService],
        exports: [chat_service_1.ChatService, chat_gateway_1.ChatGateway, cache_service_1.ChatCacheService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map