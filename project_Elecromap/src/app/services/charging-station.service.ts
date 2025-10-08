import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChargingStation } from '../models/charging-station.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChargingStationService {
  private baseUrl = `${environment.apiUrl}/stations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ChargingStation[]> {
    return this.http.get<ChargingStation[]>(this.baseUrl);
  }

  create(station: ChargingStation): Observable<ChargingStation> {
    return this.http.post<ChargingStation>(this.baseUrl, station);
  }

  update(id: number, station: ChargingStation): Observable<ChargingStation> {
    return this.http.put<ChargingStation>(`${this.baseUrl}/${id}`, station);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getById(id: number): Observable<ChargingStation> {
    return this.http.get<ChargingStation>(`${this.baseUrl}/${id}`);
  }

  
}
