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
      const locationsPath = path.join(__dirname, '../../data/nigeria-locations.json');
      const locationsData = fs.readFileSync(locationsPath, 'utf8');
      this.locations = JSON.parse(locationsData);
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