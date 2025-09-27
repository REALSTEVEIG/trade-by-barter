import { LocationsService } from '../common/services/locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getStates(): {
        states: string[];
    };
    getCitiesByState(state: string): {
        state: string;
        cities: string[];
    };
    getAllLocations(): {
        locations: {};
    };
}
