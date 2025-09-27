"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const locations_service_1 = require("../common/services/locations.service");
let LocationsController = class LocationsController {
    locationsService;
    constructor(locationsService) {
        this.locationsService = locationsService;
    }
    getStates() {
        const states = this.locationsService.getStates();
        return {
            states: states.map(state => this.locationsService.getDisplayStateName(state))
        };
    }
    getCitiesByState(state) {
        if (!this.locationsService.isValidState(state)) {
            throw new common_1.HttpException({
                message: 'State not found',
                error: 'Invalid state name',
                statusCode: 404,
            }, common_1.HttpStatus.NOT_FOUND);
        }
        const cities = this.locationsService.getCitiesByState(state);
        return {
            state: this.locationsService.getDisplayStateName(state),
            cities
        };
    }
    getAllLocations() {
        const locations = this.locationsService.getAllLocations();
        const displayLocations = {};
        Object.keys(locations).forEach(state => {
            const displayName = this.locationsService.getDisplayStateName(state);
            displayLocations[displayName] = locations[state];
        });
        return {
            locations: displayLocations
        };
    }
};
exports.LocationsController = LocationsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('states'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Nigerian states' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all Nigerian states',
        schema: {
            type: 'object',
            properties: {
                states: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "getStates", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('cities/:state'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cities for a specific state' }),
    (0, swagger_1.ApiParam)({ name: 'state', description: 'State name (e.g., Lagos, Abuja, Cross River)', example: 'Lagos' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of cities in the specified state',
        schema: {
            type: 'object',
            properties: {
                state: { type: 'string' },
                cities: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'State not found' }),
    __param(0, (0, common_1.Param)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "getCitiesByState", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Nigerian states and their cities' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Complete list of all Nigerian states and cities',
        schema: {
            type: 'object',
            properties: {
                locations: {
                    type: 'object',
                    additionalProperties: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "getAllLocations", null);
exports.LocationsController = LocationsController = __decorate([
    (0, swagger_1.ApiTags)('locations'),
    (0, common_1.Controller)('locations'),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
//# sourceMappingURL=locations.controller.js.map