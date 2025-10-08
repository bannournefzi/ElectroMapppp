import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Coordinates {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  getCoordinates(address: string): Observable<Coordinates> {
    const params = {
      q: address,
      format: 'json',
      addressdetails: '1',
      limit: '1'
    };

    return this.http.get<any[]>(this.nominatimUrl, { params }).pipe(
      map(results => {
        if (!results || results.length === 0) {
          throw new Error('Adresse non trouvée');
        }

        const result = results[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
      })
    );
  }
}
