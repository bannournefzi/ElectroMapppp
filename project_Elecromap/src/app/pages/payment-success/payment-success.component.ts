import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="success-card">
        <!-- Animation de succès -->
        <div class="success-icon">
          <div class="checkmark">
            <div class="circle"></div>
            <div class="check"></div>
          </div>
        </div>
        
        <!-- Contenu principal -->
        <div class="content">
          <h1 class="title">Paiement Confirmé !</h1>
          <p class="subtitle">Félicitations ! Votre transaction a été traitée avec succès.</p>
          
          <!-- Informations de session -->
          <div *ngIf="sessionId" class="session-info">
            <div class="info-label">Référence de transaction</div>
            <div class="info-value">{{ sessionId }}</div>
          </div>
          
          <!-- Actions -->
          <div class="actions">
            <a routerLink="/mes-reservations" class="btn-primary">
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              Voir mes réservations
            </a>
            
            <a routerLink="/" class="btn-secondary">
              Retour à l'accueil
            </a>
          </div>
        </div>
        
        <!-- Décoration -->
        <div class="decoration">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .success-card {
      background: white;
      border-radius: 24px;
      padding: 3rem 2rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
      animation: slideUp 0.8s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .success-icon {
      margin-bottom: 2rem;
    }

    .checkmark {
      position: relative;
      display: inline-block;
      width: 80px;
      height: 80px;
    }

    .circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      animation: circleScale 0.6s ease-in-out;
      position: relative;
    }

    @keyframes circleScale {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }

    .check {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 24px;
      height: 12px;
      border-left: 3px solid white;
      border-bottom: 3px solid white;
      transform: translate(-50%, -60%) rotate(-45deg);
      animation: checkDraw 0.4s ease-in-out 0.6s both;
    }

    @keyframes checkDraw {
      from {
        opacity: 0;
        transform: translate(-50%, -60%) rotate(-45deg) scale(0);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -60%) rotate(-45deg) scale(1);
      }
    }

    .content {
      animation: fadeInUp 0.8s ease-out 0.3s both;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .title {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: #718096;
      font-size: 1.1rem;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .session-info {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 2rem 0;
      border-left: 4px solid #2ecc71;
    }

    .info-label {
      color: #718096;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-value {
      color: #2d3748;
      font-weight: 600;
      font-family: 'Monaco', 'Menlo', monospace;
      background: white;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      word-break: break-all;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      color: white;
      text-decoration: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
    }

    .btn-secondary {
      color: #718096;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      color: #2d3748;
      background: #f7fafc;
    }

    .icon {
      width: 20px;
      height: 20px;
    }

    .decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      border-radius: 50%;
      opacity: 0.1;
      animation: float 6s ease-in-out infinite;
    }

    .particle-1 {
      width: 40px;
      height: 40px;
      top: 10%;
      right: 10%;
      animation-delay: 0s;
    }

    .particle-2 {
      width: 20px;
      height: 20px;
      top: 20%;
      left: 15%;
      animation-delay: 2s;
    }

    .particle-3 {
      width: 60px;
      height: 60px;
      bottom: 15%;
      right: 20%;
      animation-delay: 4s;
    }

    .particle-4 {
      width: 30px;
      height: 30px;
      bottom: 20%;
      left: 10%;
      animation-delay: 1s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(180deg);
      }
    }

    @media (max-width: 640px) {
      .container {
        padding: 1rem;
      }
      
      .success-card {
        padding: 2rem 1.5rem;
        border-radius: 16px;
      }
      
      .title {
        font-size: 1.75rem;
      }
      
      .checkmark,
      .circle {
        width: 60px;
        height: 60px;
      }
      
      .actions {
        gap: 0.75rem;
      }
      
      .btn-primary {
        padding: 0.875rem 1.5rem;
      }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payments: PaymentService
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (this.sessionId) {
      this.payments.confirmSession(this.sessionId).subscribe({
    })
   } 
    else {
      this.router.navigate(['/mes-reservations']);
    }
  }

}