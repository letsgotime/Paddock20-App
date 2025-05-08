declare module 'smartcar' {
  export interface SmartcarOptions {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope?: string[];
    testMode?: boolean;
    mode?: 'test' | 'live' | 'simulated';
  }

  export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiration: number;
    refreshExpiration: number;
    vehicles: string[];
  }

  export interface VehicleInfo {
    id: string;
    make: string;
    model: string;
    year: number;
    [key: string]: any;
  }

  export interface VinInfo {
    vin: string;
  }

  export interface OdometerInfo {
    distance: number;
    unit: string;
  }

  export interface FuelInfo {
    range: number;
    percentRemaining: number;
    amountRemaining: number;
  }

  export interface BatteryInfo {
    range: number;
    percentRemaining: number;
  }

  export interface TirePressureInfo {
    frontLeft: number | null;
    frontRight: number | null;
    backLeft: number | null;
    backRight: number | null;
  }

  export interface LocationInfo {
    latitude: number;
    longitude: number;
  }

  export interface AuthClient {
    getAuthUrl(options?: {scope?: string[]}): string;
    exchangeCode(code: string): Promise<TokenResponse>;
    exchangeRefreshToken(refreshToken: string): Promise<TokenResponse>;
  }

  export interface Vehicle {
    info(): Promise<VehicleInfo>;
    vin(): Promise<VinInfo>;
    odometer(): Promise<OdometerInfo>;
    fuel(): Promise<FuelInfo>;
    battery(): Promise<BatteryInfo>;
    tirePressure(): Promise<TirePressureInfo>;
    location(): Promise<LocationInfo>;
    lock(): Promise<void>;
    unlock(): Promise<void>;
    disconnect(): Promise<void>;
  }

  export default function smartcar(options: SmartcarOptions): AuthClient;
  export function getVehicle(accessToken: string, vehicleId: string): Vehicle;
}