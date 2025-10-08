// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { loadStripe } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

interface CreateCheckoutSessionRequest { reservationId: number; }
interface CreateCheckoutSessionResponse { sessionId: string; url: string; }

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private base = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  async startCheckout(reservationId: number): Promise<void> {
    const req: CreateCheckoutSessionRequest = { reservationId };
    const res = await firstValueFrom(
      this.http.post<CreateCheckoutSessionResponse>(`${this.base}/checkout/session`, req)
    );

    if (!res?.sessionId && !res?.url) throw new Error('Aucune session de paiement retournée');

    // Try Stripe.js first
    try {
      const stripe = await loadStripe(environment.stripePublishableKey);
      if (!stripe) throw new Error('Stripe.js introuvable');
      const { error } = await stripe.redirectToCheckout({ sessionId: res.sessionId });
      if (error) throw error;
      return;
    } catch (e) {
      console.warn('redirectToCheckout a échoué, fallback via URL directe', e);
    }
    if (res?.url) {
      window.location.href = res.url;
    } else {
      throw new Error('Impossible de rediriger vers Stripe Checkout');
    }
  }

  // Plain text response from backend → force text
  getReservationStatus(reservationId: number) {
    return this.http.get(`${this.base}/reservation/${reservationId}/status`, {
      responseType: 'text'
    });
  }

  // Confirm session after success redirect
  confirmSession(sessionId: string) {
    return this.http.post(`${this.base}/confirm`, null, {
      params: { session_id: sessionId },
      responseType: 'text'
    });
  }
}
