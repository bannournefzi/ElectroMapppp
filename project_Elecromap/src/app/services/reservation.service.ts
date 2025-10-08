import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators'; 

export interface ReservationStation {
  id?: number;
  utilisateurId: number;
  stationId: number;
  pourcentageChargeActuelle: number;
  tempsEstimeMinutes: number;
  dateReservation: string; // ISO string
  dateFinPrevue: string; // ISO string
  typeVehicule: string;
  statut?: 'ACTIVE' | 'TERMINEE' | 'ANNULEE';
  coutEstime?: number;
  energieAjoutee?: number;
}

export interface CreateReservationRequest {
  stationId: number;
  typeVehicule: string;
  pourcentageChargeActuelle: number;
  dateReservation: string;
  heureDebut: string;
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  reservation?: ReservationStation;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly API_URL = `${environment.apiUrl}/reservations`;
  private reservationsSubject = new BehaviorSubject<ReservationStation[]>([]);
  public reservations$ = this.reservationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Créer une réservation (ancienne méthode de compatibilité) */
  reserverStation(reservation: any): Observable<any> {
    return this.http.post(`${this.API_URL}`, reservation);
  }

  /** Nouvelle méthode pour créer une réservation enrichie */
  createReservation(reservationData: CreateReservationRequest): Observable<ReservationResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<ReservationResponse>(`${this.API_URL}`, reservationData, { headers })
      .pipe(
        tap(response => {
          if (response.success && response.reservation) {
            this.refreshReservations();
          }
        }),
        catchError(error => {
          console.error('Erreur lors de la création de la réservation:', error);
          throw error;
        })
      );
  }

  getMesReservations(): Observable<any> {
    return this.http.get(`${this.API_URL}/me`);
  }

  getUserReservations(userId: number): Observable<ReservationStation[]> {
    return this.http.get<ReservationStation[]>(`${this.API_URL}/user/${userId}`)
      .pipe(
        tap(reservations => this.reservationsSubject.next(reservations)),
        catchError(error => {
          console.error('Erreur lors de la récupération des réservations:', error);
          throw error;
        })
      );
  }

  getReservationById(id: number): Observable<ReservationStation> {
    return this.http.get<ReservationStation>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération de la réservation:', error);
          throw error;
        })
      );
  }

  cancelReservation(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.API_URL}/${id}/cancel`, {})
      .pipe(
        tap(response => {
          if (response.success) {
            this.refreshReservations();
          }
        }),
        catchError(error => {
          console.error('Erreur lors de l\'annulation de la réservation:', error);
          throw error;
        })
      );
  }

  updateReservation(id: number, updates: Partial<ReservationStation>): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.API_URL}/${id}`, updates)
      .pipe(
        tap(response => {
          if (response.success) {
            this.refreshReservations();
          }
        }),
        catchError(error => {
          console.error('Erreur lors de la mise à jour de la réservation:', error);
          throw error;
        })
      );
  }

  checkAvailability(stationId: number, dateDebut: string, dateFin: string): Observable<boolean> {
  const params = {
    stationId: stationId.toString(),
    dateDebut,
    dateFin
  };

  return this.http.get<{ available: boolean }>(`${this.API_URL}/check-availability`, { params })
    .pipe(
      map(response => response.available), // <-- ici on transforme correctement
      catchError(error => {
        console.error('Erreur lors de la vérification de disponibilité:', error);
        throw error;
      })
    );
}

  getAvailableSlots(stationId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/available-slots/${stationId}/${date}`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des créneaux:', error);
          throw error;
        })
      );
  }

  calculateCost(currentCharge: number, targetCharge: number = 80, batterySize: number = 75): number {
    const energyNeeded = ((targetCharge - currentCharge) / 100) * batterySize;
    const pricePerKWh = 0.35;
    return Math.max(0, energyNeeded * pricePerKWh);
  }

  calculateChargingTime(currentCharge: number, targetCharge: number = 80, batterySize: number = 75, chargingPower: number = 50): number {
    const energyNeeded = ((targetCharge - currentCharge) / 100) * batterySize;
    return Math.max(0, (energyNeeded / chargingPower) * 60);
  }

  private refreshReservations(): void {
    const userId = this.getCurrentUserId();
    if (userId) {
      this.getUserReservations(userId).subscribe();
    }
  }

  private getCurrentUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.id || null;
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  canCancelReservation(reservation: ReservationStation): boolean {
    const now = new Date();
    const reservationDate = new Date(reservation.dateReservation);
    const hoursUntilReservation = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilReservation > 1 && reservation.statut === 'ACTIVE';
  }

  getUserStats(userId: number): Observable<{
    totalReservations: number;
    activeReservations: number;
    totalEnergyCharged: number;
    totalCost: number;
  }> {
    return this.http.get<any>(`${this.API_URL}/user/${userId}/stats`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des statistiques:', error);
          throw error;
        })
      );
  }
}
