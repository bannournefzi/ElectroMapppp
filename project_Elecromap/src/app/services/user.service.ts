import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
private apiUrl = `${environment.apiUrl}/users`; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}

updateUser(user: User): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
}
createUser(user: User): Observable<User> {
  return this.http.post<User>(this.apiUrl, user);
}
}
