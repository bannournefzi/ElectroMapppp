export interface CreateCheckoutSessionRequest {
  reservationId: number;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}