import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RegistrationRequest
} from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  register(request: RegistrationRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, request);
  }

  logout(): void {
  localStorage.removeItem('access_token');
}

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/authenticate`, request);
  }

  activateAccount(token: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/activate-account?token=${token}`);
  }
  
  getUserFullName(): string {
  const token = localStorage.getItem('access_token');
  if (!token) return 'Utilisateur';

  try {
    const decoded: any = jwtDecode(token);
    return decoded.fullName ?? 'Utilisateur'; // ✅ utiliser la bonne clé ici
  } catch (e) {
    return 'Utilisateur';
  }
}

}
