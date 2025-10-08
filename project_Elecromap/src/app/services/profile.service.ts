import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export interface UserProfileDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  carType?: string;
  accountLocked: boolean;
  enabled: boolean;
  roles: string[];
  creationDate: string;
  lastModifiedDate: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  me() { return this.http.get<UserProfileDTO>(`${this.base}/profile/me`); }
  byId(id: number) { return this.http.get<UserProfileDTO>(`${this.base}/users/${id}`); }
}