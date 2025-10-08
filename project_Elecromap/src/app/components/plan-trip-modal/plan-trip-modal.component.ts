import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TrajetService } from 'src/app/services/TrajetService.service';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-plan-trip-modal',
  templateUrl: './plan-trip-modal.component.html',
  styleUrls: ['./plan-trip-modal.component.scss']
})
export class PlanTripModalComponent {
  depart: string = '';
  destination: string = '';
  charge: number = 50;

  @Output() trajetPlanifie = new EventEmitter<any>();
  @Output() fermerModal = new EventEmitter<void>();

  constructor(
    private trajetService: TrajetService,
    private geocodingService: GeocodingService,
    private router: Router
  ) {}

  fermer() {
    this.fermerModal.emit();
  }

  planifierTrajet() {
    // Étape 1: convertir l'adresse de départ en coordonnées
    this.geocodingService.getCoordinates(this.depart).subscribe({
      next: (departCoords) => {
        // Étape 2: convertir l'adresse de destination
        this.geocodingService.getCoordinates(this.destination).subscribe({
          next: (destCoords) => {
            // Étape 3: sauvegarder le trajet dans la base
            const trajet = {
              pointDepart: this.depart,
              destination: this.destination,
              chargeActuelle: this.charge,
              stationsSuggerees: []  // éventuellement calculé plus tard
            };

            this.trajetService.saveTrajet(trajet).subscribe({
              next: (response) => {
                console.log('✅ Trajet sauvegardé avec succès:', response);
                this.trajetPlanifie.emit(response);

                // Étape 4: rediriger vers la carte
                this.router.navigate(['/mapuser'], {
                  queryParams: {
                    from: `${departCoords.lat},${departCoords.lng}`,
                    to: `${destCoords.lat},${destCoords.lng}`,
                    charge: this.charge
                  }
                });
              },
              error: (err) => {
                console.error('❌ Erreur lors de la sauvegarde:', err);
              }
            });
          },
          error: () => alert('❌ Adresse destination invalide')
        });
      },
      error: () => alert('❌ Adresse de départ invalide')
    });
  }
}
