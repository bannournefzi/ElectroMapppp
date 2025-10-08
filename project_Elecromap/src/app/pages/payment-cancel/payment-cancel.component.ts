import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <h1>❌ Paiement annulé</h1>
      <p>Vous pouvez réessayer quand vous voulez.</p>
      <a routerLink="/mes-reservations" class="btn">Retour</a>
    </div>
  `,
  styles: [`.page{max-width:640px;margin:10vh auto;text-align:center}.btn{display:inline-block;margin-top:1rem;padding:.6rem 1rem;border-radius:.75rem;background:#3498db;color:#fff;text-decoration:none}`]
})
export class PaymentCancelComponent {}
