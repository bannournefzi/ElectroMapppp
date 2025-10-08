export interface ChargingStation {
  id?: number;               // facultatif à la création
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  available: boolean;
  working: boolean;
  type?: string; 
  address?: string;
  power?: number;
  compatibleVehicles?: string[]; // tableau de strings
  connectorTypes?: string;
  averageChargeTime?: number;
  pricePerKwh?: number;      

}
export interface ChargingStationUI extends ChargingStation {
  distance?: number;    
  isFavorite?: boolean;
}