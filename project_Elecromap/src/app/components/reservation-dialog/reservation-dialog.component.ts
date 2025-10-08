import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';

interface EstimationRecharge {
  tempsEstime: number;
  finPrevue: string;
  coutEstime: number;
  energieAjoutee: number;
}

interface ReservationData {
  typeVehicule: string;
  pourcentageChargeActuelle: number;
  dateReservation: string;
  heureDebut: string;
  tempsEstimeMinutes: number;
  dateFinPrevue: string;
}

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.scss']
})
export class ReservationDialogComponent implements OnInit {
  reservationForm: FormGroup;
  isSubmitting = false;
  pourcentageChargeActuelle = 50;
  estimation: EstimationRecharge | null = null;
  minDate: string;
  isModal = true;
  stationId!: number;

  voitures = [
    'Tesla Model 3', 'Tesla Model S', 'Tesla Model X', 'Tesla Model Y',
    'Renault Zoe', 'Nissan Leaf', 'BMW i3', 'Volkswagen ID.3', 'Volkswagen ID.4',
    'Peugeot e-208', 'Citroën ë-C4', 'Hyundai Kona Electric', 'Kia e-Niro',
    'Audi e-tron', 'Mercedes EQC', 'Autre'
  ];

  private readonly CHARGING_SPEED = 50; // kW
  private readonly AVERAGE_BATTERY_SIZE = 75; // kWh
  private readonly PRICE_PER_KWH = 0.35; // €/kWh
  private readonly TARGET_CHARGE = 80; // %

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private route: ActivatedRoute,
    private router: Router,
    @Optional() private dialogRef?: MatDialogRef<ReservationDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { stationId: number }
  ) {
    this.minDate = new Date().toISOString().split('T')[0];

    this.reservationForm = this.fb.group({
      typeVehicule: ['', Validators.required],
      pourcentageChargeActuelle: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      dateReservation: [this.minDate, Validators.required],
      heureDebut: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data?.stationId) {
      this.stationId = this.data.stationId;
      this.isModal = true;
    } else {
      this.stationId = Number(this.route.snapshot.paramMap.get('stationId'));
      this.isModal = false;
    }

    this.calculateEstimation();
    this.reservationForm.valueChanges.subscribe(() => {
      this.calculateEstimation();
    });
  }

  updateBatteryLevel(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.pourcentageChargeActuelle = parseInt(target.value, 10);
    this.reservationForm.patchValue({ pourcentageChargeActuelle: this.pourcentageChargeActuelle });
  }

  getBatteryClass(): string {
    if (this.pourcentageChargeActuelle < 20) return 'low';
    if (this.pourcentageChargeActuelle < 50) return 'medium';
    return 'high';
  }

  calculateEstimation(): void {
    const formValue = this.reservationForm.value;

    if (!formValue.dateReservation || !formValue.heureDebut) {
      this.estimation = null;
      return;
    }

    const currentCharge = this.pourcentageChargeActuelle;
    const energyNeeded = Math.max(0, ((this.TARGET_CHARGE - currentCharge) / 100) * this.AVERAGE_BATTERY_SIZE);
    const timeNeeded = Math.max(0, (energyNeeded / this.CHARGING_SPEED) * 60); // minutes
    const cost = energyNeeded * this.PRICE_PER_KWH;

    const [hours, minutes] = formValue.heureDebut.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    startDate.setMinutes(startDate.getMinutes() + Math.round(timeNeeded));

    const endTime = startDate.toTimeString().substring(0, 5);

    this.estimation = {
      tempsEstime: Math.round(timeNeeded),
      finPrevue: endTime,
      coutEstime: parseFloat(cost.toFixed(2)),
      energieAjoutee: parseFloat(energyNeeded.toFixed(1))
    };
  }

  onSubmit(): void {
    if (this.reservationForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    const formValue = this.reservationForm.value;
    const fullDateReservation = `${formValue.dateReservation}T${formValue.heureDebut}:00`;

    const payload = {
          station: { id: this.stationId },
          typeVehicule: formValue.typeVehicule,
          pourcentageChargeActuelle: this.pourcentageChargeActuelle,
          dateReservation: fullDateReservation, // ✅ format ISO correct
          tempsEstimeMinutes: this.estimation?.tempsEstime || 0,
          dateFinPrevue: this.calculateEndDateTime(formValue.dateReservation, formValue.heureDebut)
};

    this.reservationService.reserverStation(payload).subscribe({
      next: () => {
        alert('Réservation réussie ✅');
        if (this.isModal) {
          this.dialogRef?.close(true);
        } else {
          this.router.navigate(['/mes-reservations']);
        }
      },
      error: () => {
        alert('Erreur ❌ lors de la réservation');
        this.isSubmitting = false;
      }
    });
  }

  annulerReservation(id: number) {
  this.reservationService.cancelReservation(id).subscribe({
    next: () => {
      alert('Réservation annulée ❌');
      this.router.navigate(['/user']); // redirection après annulation
    },
    error: () => {
      alert('Erreur lors de l\'annulation');
    }
  });
}

  private calculateEndDateTime(date: string, time: string): string {
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');

    const startDateTime = new Date(
      parseInt(year), parseInt(month) - 1, parseInt(day),
      parseInt(hours), parseInt(minutes)
    );

    if (this.estimation) {
      startDateTime.setMinutes(startDateTime.getMinutes() + this.estimation.tempsEstime);
    }

    return startDateTime.toISOString().slice(0, 19);  

  }

  close(): void {
    if (this.isModal) {
      this.dialogRef?.close();
    } else {
      this.router.navigate(['/user']);
    }
  }
}
