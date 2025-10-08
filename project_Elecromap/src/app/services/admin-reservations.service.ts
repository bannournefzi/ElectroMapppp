// src/app/services/admin-reservations.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface AdminUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AdminStation {
  id: number;
  name?: string;
  address?: string;
  power?: number;
}

export type AdminReservationStatus = 'EN_ATTENTE'|'EN_COURS'|'EN_CHARGE'|'TERMINEE'|'ANNULEE'|'EXPIREE';

export interface AdminReservation {
  id: number;
  utilisateur: AdminUser;
  station: AdminStation;
  typeVehicule: string;
  pourcentageChargeActuelle: number;
  tempsEstimeMinutes: number;
  dateReservation: string;    
  dateFinPrevue: string;    
  statut: AdminReservationStatus;
  paiementStatut?: 'PENDING'|'SUCCEEDED'|'FAILED'|'NONE';
}

export interface AdminReservationPage {
  content: AdminReservation[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AdminReservationsService {
  private base = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  /**
   * GET toutes les réservations (avec filtres optionnels côté backend).
   * Si ton backend ne pagine pas encore, remplace le type de retour par AdminReservation[].
   */
  getAll(params: {
    page?: number; size?: number;
    status?: AdminReservationStatus | '';
    q?: string;              
    from?: string;      
    to?: string;             
    stationId?: number;
    userId?: number;
  } = {}): Observable<AdminReservationPage> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') httpParams = httpParams.set(k, String(v));
    });

     return this.http.get<AdminReservationPage>(`${this.base}/all`, { params: httpParams });
  }

   getPaymentStatus(reservationId: number) {
    return this.http.get<string>(`${environment.apiUrl}/payments/reservation/${reservationId}/status`, { responseType: 'text' as any });
  }

   cancel(reservationId: number) {
    return this.http.post<void>(`${this.base}/${reservationId}/cancel`, {});
  }
  delete(id: number) {
  return this.http.delete<void>(`${this.base}/admin/reservations/${id}`);
}
}
