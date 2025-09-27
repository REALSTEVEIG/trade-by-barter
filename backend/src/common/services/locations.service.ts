import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface LocationData {
  [state: string]: string[];
}

@Injectable()
export class LocationsService {
  private locations: LocationData;

  constructor() {
    this.loadLocations();
  }

  private loadLocations(): void {
    try {
      // Try multiple possible paths for the locations file
      const possiblePaths = [
        path.join(__dirname, '../../data/nigeria-locations.json'),
        path.join(__dirname, '../../../src/data/nigeria-locations.json'),
        path.join(process.cwd(), 'src/data/nigeria-locations.json'),
        path.join(process.cwd(), 'dist/data/nigeria-locations.json')
      ];

      let locationsData: string | null = null;
      
      for (const locationsPath of possiblePaths) {
        try {
          if (fs.existsSync(locationsPath)) {
            locationsData = fs.readFileSync(locationsPath, 'utf8');
            console.log(`Successfully loaded locations from: ${locationsPath}`);
            break;
          }
        } catch (err) {
          // Continue to next path
          continue;
        }
      }

      if (locationsData) {
        this.locations = JSON.parse(locationsData);
      } else {
        console.error('Failed to find Nigerian locations data file in any of the expected locations');
        this.locations = {};
      }
    } catch (error) {
      console.error('Failed to load Nigerian locations data:', error);
      this.locations = {};
    }
  }

  getStates(): string[] {
    return Object.keys(this.locations).sort();
  }

  getCitiesByState(state: string): string[] {
    const normalizedState = state.toUpperCase().replace(/\s+/g, '_');
    return this.locations[normalizedState] || [];
  }

  getAllLocations(): LocationData {
    return this.locations;
  }

  isValidState(state: string): boolean {
    const normalizedState = state.toUpperCase().replace(/\s+/g, '_');
    return normalizedState in this.locations;
  }

  isValidCity(state: string, city: string): boolean {
    const cities = this.getCitiesByState(state);
    return cities.some(c => c.toLowerCase() === city.toLowerCase());
  }

  normalizeStateName(state: string): string {
    return state.toUpperCase().replace(/\s+/g, '_');
  }

  getDisplayStateName(state: string): string {
    return state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}