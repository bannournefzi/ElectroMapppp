import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AuthenticationRequest } from '../../models/auth.model';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const request: AuthenticationRequest = this.loginForm.value;

    this.authService.login(request).subscribe({
      next: (response) => {
        const token = response.token;
        localStorage.setItem('access_token', token);

         const decoded: any = jwtDecode(token);
        const roles: string[] = decoded.roles || [];

         if (roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/admin']);
        } else if (roles.includes('ROLE_USER')) {
          this.router.navigate(['/user']);
        } else {
          this.router.navigate(['/']); // fallback
        }
      },
      error: () => {
        this.errorMessage = 'Email ou mot de passe incorrect.';
      }
    });
  }
}
