import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validate-account',
  templateUrl: './validate-account.component.html',
  styleUrls: ['./validate-account.component.scss']
})
export class ValidateAccountComponent {
  form: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    const token = this.form.value.token;

    this.authService.activateAccount(token).subscribe({
      next: () => {
        this.successMessage = '✅ Compte activé avec succès.';
        this.errorMessage = null;
        this.form.reset();

        // Rediriger vers la page de login après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.errorMessage = '❌ Code invalide ou expiré.';
        this.successMessage = null;
      }
    });
  }
}
