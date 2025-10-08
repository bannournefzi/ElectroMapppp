import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // ✅ import pour `apiUrl`

@Injectable({ providedIn: 'root' })
export class TrajetService {
  private apiUrl = `${environment.apiUrl}/trajets`;

  constructor(private http: HttpClient) {}

  saveTrajet(trajet: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, trajet);
  }

  getTrajetById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAllTrajets(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  planifierTrajet(data: {
    pointDepart: string;
    destination: string;
    chargeActuelle: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/planifie`, data);
  }
}
