"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerConfig = void 0;
const swagger_1 = require("@nestjs/swagger");
exports.swaggerConfig = new swagger_1.DocumentBuilder()
    .setTitle('TradeByBarter API')
    .setDescription('Nigerian Barter Marketplace - Comprehensive API Documentation')
    .setVersion('1.0.0')
    .setContact('TradeByBarter Support', 'https://tradebybarter.ng/support', 'hello@tradebybarter.ng')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('https://api.tradebybarter.ng/v1', 'Production Server')
    .addServer('https://staging-api.tradebybarter.ng/v1', 'Staging Server')
    .addServer('http://localhost:3001/v1', 'Development Server')
    .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Enter JWT token',
    in: 'header',
}, 'JWT-auth')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile and account management')
    .addTag('Listings', 'Product listings and marketplace operations')
    .addTag('Barter', 'Barter transactions and negotiations')
    .addTag('Categories', 'Product categories and subcategories')
    .addTag('Locations', 'Nigerian locations and geographical data')
    .addTag('Search', 'Search and filtering functionality')
    .addTag('Notifications', 'Push notifications and messaging')
    .addTag('Admin', 'Administrative operations')
    .addTag('Analytics', 'Usage analytics and reporting')
    .build();
//# sourceMappingURL=swagger.config.js.map