import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LocationsService } from '../common/services/locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('states')
  @ApiOperation({ summary: 'Get all Nigerian states' })
  @ApiResponse({ 
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
  })
  getStates() {
    const states = this.locationsService.getStates();
    return {
      states: states.map(state => this.locationsService.getDisplayStateName(state))
    };
  }

  @Get('cities/:state')
  @ApiOperation({ summary: 'Get cities for a specific state' })
  @ApiParam({ name: 'state', description: 'State name (e.g., Lagos, Abuja, Cross River)', example: 'Lagos' })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'State not found' })
  getCitiesByState(@Param('state') state: string) {
    if (!this.locationsService.isValidState(state)) {
      throw new HttpException(
        {
          message: 'State not found',
          error: 'Invalid state name',
          statusCode: 404,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const cities = this.locationsService.getCitiesByState(state);
    return {
      state: this.locationsService.getDisplayStateName(state),
      cities
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all Nigerian states and their cities' })
  @ApiResponse({ 
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
  })
  getAllLocations() {
    const locations = this.locationsService.getAllLocations();
    
    // Convert to display format with proper state names
    const displayLocations = {};
    Object.keys(locations).forEach(state => {
      const displayName = this.locationsService.getDisplayStateName(state);
      displayLocations[displayName] = locations[state];
    });

    return {
      locations: displayLocations
    };
  }
}