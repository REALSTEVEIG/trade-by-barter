export interface LocationData {
    [state: string]: string[];
}
export declare class LocationsService {
    private locations;
    constructor();
    private loadLocations;
    getStates(): string[];
    getCitiesByState(state: string): string[];
    getAllLocations(): LocationData;
    isValidState(state: string): boolean;
    isValidCity(state: string, city: string): boolean;
    normalizeStateName(state: string): string;
    getDisplayStateName(state: string): string;
}
