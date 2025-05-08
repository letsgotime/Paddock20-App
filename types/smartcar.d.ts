declare module 'smartcar' {
  export interface SmartcarVehicleInfo {
    id: string;
    make: string;
    model: string;
    year: string;
    trim?: string;
    fuel?: boolean;
    battery?: boolean;
  }

  export interface SmartcarOdometerResponse {
    distance: number;
    unitSystem: 'metric' | 'imperial';
    timestamp: string;
  }

  export interface SmartcarFuelResponse {
    range: number;
    percentRemaining: number;
    amountRemaining: number;
    timestamp: string;
  }

  export interface SmartcarBatteryResponse {
    range: number;
    percentRemaining: number;
    timestamp: string;
  }

  export interface SmartcarLocationResponse {
    latitude: number;
    longitude: number;
    timestamp: string;
  }

  export interface SmartcarVinResponse {
    vin: string;
  }

  export interface SmartcarTiresResponse {
    frontLeft?: number;
    frontRight?: number;
    backLeft?: number;
    backRight?: number;
    unitSystem: 'metric' | 'imperial';
    timestamp: string;
  }

  export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiration: Date;
    refreshExpiration: Date;
    vehicles: string[];
  }

  export class AuthClient {
    constructor(options: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      testMode?: boolean;
    });
    
    getAuthUrl(scope: string[]): string;
    exchangeCode(code: string): Promise<TokenResponse>;
    exchangeRefreshToken(refreshToken: string): Promise<TokenResponse>;
  }

  export class Vehicle {
    constructor(id: string, accessToken: string);
    
    info(): Promise<SmartcarVehicleInfo>;
    odometer(): Promise<SmartcarOdometerResponse>;
    fuel(): Promise<SmartcarFuelResponse>;
    battery(): Promise<SmartcarBatteryResponse>;
    location(): Promise<SmartcarLocationResponse>;
    vin(): Promise<SmartcarVinResponse>;
    tires(): Promise<SmartcarTiresResponse>;
  }

  export default {
    AuthClient,
    Vehicle
  };
}