import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, interval, forkJoin } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../auth/auth.service';
import { PaymentService } from 'src/app/services/payment.service';  
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

interface Station {
  id: number;
  name: string;
  nom?: string;
  address?: string;    
  adresse?: string;   
  latitude?: number;
  longitude?: number;
}

interface Reservation {
  stationNom?: string;
  stationAdresse?: string;
  id: number;
  stationId: number;
  station?: Station;
  dateReservation: Date;
  dateFinPrevue: Date;
  tempsEstimeMinutes: number;
  pourcentageChargeActuelle: number;
  pourcentageChargeSouhaite?: number;
  typeVehicule: string;
  statut: 'ACTIVE' | 'TERMINEE' | 'ANNULEE' | 'EN_ATTENTE';
  energieAjoutee?: number;
  coutEstime?: number;
  cancelling?: boolean;
  statutDetaille?: 'EN_ATTENTE' | 'EN_COURS' | 'EN_CHARGE' | 'TERMINEE' | 'ANNULEE' | 'EXPIREE';
  dateDebut?: Date;  
  paiementStatut?: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'NONE';
}

interface ReservationStats {
  activeReservations: number;
  totalReservations: number;
  totalEnergyCharged: number;
  enCoursReservations: number;
  enChargeReservations: number;
}

type StatutDetaille = 'EN_ATTENTE' | 'EN_COURS' | 'EN_CHARGE' | 'TERMINEE' | 'ANNULEE' | 'EXPIREE';

@Component({
  selector: 'app-mes-reservations',
  templateUrl: './mes-reservations.component.html',
  styleUrls: ['./mes-reservations.component.scss']
})
export class MesReservationsComponent implements OnInit, OnDestroy {

  readonly PAYABLE_STATUSES: ReadonlyArray<StatutDetaille> = ['EN_ATTENTE', 'EXPIREE'];

  isPayable(reservation: any): boolean {
    const s = (reservation.statutDetaille ?? 'EN_ATTENTE') as
      'EN_ATTENTE' | 'EN_COURS' | 'EN_CHARGE' | 'TERMINEE' | 'ANNULEE' | 'EXPIREE';

    const allowed = (s === 'EN_ATTENTE' || s === 'EN_COURS' || s === 'EXPIREE');
    const notPaid = reservation.paiementStatut !== 'SUCCEEDED';
    return allowed && notPaid;
  }

  // NOUVEAU : Vérifier si le paiement est réussi
  isPaymentSucceeded(reservation: any): boolean {
    return reservation.paiementStatut === 'SUCCEEDED';
  }

  // NOUVEAU : Obtenir le libellé du statut de paiement
  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'SUCCEEDED': 'Payé',
      'PENDING': 'En attente',
      'FAILED': 'Échec',
      'NONE': 'Non payé'
    };
    return labels[status] || 'Non défini';
  }

  // NOUVEAU : Obtenir l'icône du statut de paiement
  getPaymentStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'SUCCEEDED': 'fa-check-circle',
      'PENDING': 'fa-clock',
      'FAILED': 'fa-exclamation-triangle',
      'NONE': 'fa-credit-card'
    };
    return icons[status] || 'fa-question-circle';
  }
  
  loadingPaymentId: number | null = null;
  paymentErrors: Record<number, string> = {};
  showDetailsModal = false;
  selectedReservation: Reservation | null = null;
  sidebarCollapsed = false;
  showProfileDropdown = false;
  searchTerm = '';
  favoritesCount = 2;
  upcomingBookings = 1;
  userName = 'Utilisateur';
  userAvatar = '';
  userStatus = 'En ligne';
  activeRoute = '';
  messageTrajet: string = '';
  notificationCount = 3;
  private destroy$ = new Subject<void>();

  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  paginatedReservations: Reservation[] = [];
  stats: ReservationStats = {
    activeReservations: 0,
    totalReservations: 0,
    totalEnergyCharged: 0,
    enCoursReservations: 0,
    enChargeReservations: 0
  };

  isLoading = true;
  showCancelModal = false;
  reservationToCancel: Reservation | null = null;

  activeFilter = 'all';
  sortBy = 'dateDesc';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  showNotifications = false;

  constructor(
    private paymentService: PaymentService,
    private reservationService: ReservationService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.loadReservations();
    this.startAutoRefresh();
    this.userName = this.authService.getUserFullName();
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    setTimeout(() => this.router.navigate(['/mes-reservations'], { queryParams: { refresh: Date.now() }}), 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateDetailedStatus(reservation: Reservation): 'EN_ATTENTE' | 'EN_COURS' | 'EN_CHARGE' | 'TERMINEE' | 'ANNULEE' | 'EXPIREE' {
    if (reservation.statut === 'ANNULEE') return 'ANNULEE';
    if (reservation.statut === 'TERMINEE') return 'TERMINEE';

    const now = new Date();
    const dateReservation = new Date(reservation.dateReservation);
    const dateFinPrevue = new Date(reservation.dateFinPrevue);
    const dateDebut = reservation.dateDebut ? new Date(reservation.dateDebut) : null;

    if (now > dateFinPrevue && !['TERMINEE', 'ANNULEE'].includes(reservation.statut)) {
      return 'EXPIREE';
    }

    if (now < dateReservation) {
      return 'EN_ATTENTE';
    }

    if (now >= dateReservation && now <= dateFinPrevue) {
      if (dateDebut && now >= dateDebut) {
        return 'EN_CHARGE';
      }
      return 'EN_COURS';
    }

    return 'EN_ATTENTE';
  }

  loadReservations(): void {
    this.isLoading = true;

    this.reservationService.getMesReservations().subscribe({
      next: (data: Reservation[]) => {
        this.reservations = data.map(reservation => ({
          ...reservation,
          statutDetaille: this.calculateDetailedStatus(reservation)
        }));
        
        this.calculateStats();
        this.filterReservations();
        this.sortReservations();
        this.attachPaymentStatuses();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.notificationService.showError('Impossible de charger vos réservations');
        this.isLoading = false;
      }
    });
  }

  private startAutoRefresh(): void {
  interval(15000) // 15s
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      if (this.hasActiveReservations()) {
        // recompute reservation detailed status
        this.reservations = this.reservations.map(r => ({
          ...r,
          statutDetaille: this.calculateDetailedStatus(r)
        }));
        // 🔁 re-check payments for pending/none
        this.refreshPendingPaymentStatuses();

        this.calculateStats();
        this.filterReservations();
        this.sortReservations();
      }
    });
}
private refreshPendingPaymentStatuses(): void {
  const target = this.reservations.filter(
    r => r.paiementStatut === 'PENDING' || r.paiementStatut === 'NONE' || !r.paiementStatut
  );
  if (!target.length) return;

  const calls = target.map(r =>
    this.paymentService.getReservationStatus(r.id).pipe(map(status => ({ id: r.id, status })))
  );

  forkJoin(calls).subscribe({
    next: pairs => {
      const mapStatus = new Map(pairs.map(p => [p.id, p.status]));
      this.reservations = this.reservations.map(r =>
        mapStatus.has(r.id) ? { ...r, paiementStatut: mapStatus.get(r.id) as any } : r
      );
      this.filterReservations();
      this.sortReservations();
    }
  });
}

  private attachPaymentStatuses(): void {
    if (!this.reservations?.length) return;

    const calls = this.reservations.map(r =>
      this.paymentService.getReservationStatus(r.id).pipe(
        map(status => ({ id: r.id, status }))
      )
    );

    forkJoin(calls).subscribe({
      next: pairs => {
        const byId = new Map(pairs.map(p => [p.id, p.status]));
        this.reservations = this.reservations.map(r => ({
          ...r,
          paiementStatut: (byId.get(r.id) as any) ?? 'NONE'
        }));

        this.calculateStats();
        this.filterReservations();
        this.sortReservations();
      },
      error: () => {
        this.filterReservations();
        this.sortReservations();
      }
    });
  }

  private hasActiveReservations(): boolean {
    return this.reservations.some(r => 
      r.statutDetaille === 'EN_COURS' || 
      r.statutDetaille === 'EN_CHARGE' || 
      r.statutDetaille === 'EN_ATTENTE'
    );
  }

  private calculateStats(): void {
    this.stats.totalReservations = this.reservations.length;
    this.stats.activeReservations = this.reservations.filter(r => 
      r.statutDetaille === 'EN_COURS' || 
      r.statutDetaille === 'EN_CHARGE' || 
      r.statutDetaille === 'EN_ATTENTE'
    ).length;
    this.stats.enCoursReservations = this.reservations.filter(r => r.statutDetaille === 'EN_COURS').length;
    this.stats.enChargeReservations = this.reservations.filter(r => r.statutDetaille === 'EN_CHARGE').length;
    
    this.stats.totalEnergyCharged = this.reservations
      .filter(r => r.energieAjoutee && r.energieAjoutee > 0)
      .reduce((total, r) => total + (r.energieAjoutee || 0), 0);
  }

  viewDetails(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showDetailsModal = true;
  }

  filterReservations(): void {
    let filtered = [...this.reservations];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(reservation =>
        (reservation.station?.name?.toLowerCase().includes(term)) ||
        (reservation.station?.address?.toLowerCase().includes(term)) ||
        (reservation.typeVehicule?.toLowerCase().includes(term))
      );
    }

    if (this.activeFilter !== 'all') {
      const statusMap: { [key: string]: string[] } = {
        'active': ['EN_ATTENTE', 'EN_COURS', 'EN_CHARGE'],
        'en_attente': ['EN_ATTENTE'],
        'en_cours': ['EN_COURS'],
        'en_charge': ['EN_CHARGE'],
        'completed': ['TERMINEE'],
        'cancelled': ['ANNULEE'],
        'expired': ['EXPIREE']
      };
      
      if (statusMap[this.activeFilter]) {
        filtered = filtered.filter(r => statusMap[this.activeFilter].includes(r.statutDetaille || ''));
      }
    }

    this.filteredReservations = filtered;
    this.updatePagination();
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.filterReservations();
    this.sortReservations();
  }

  getFilteredCount(status: string): number {
    switch(status) {
      case 'ACTIVE':
        return this.reservations.filter(r => 
          r.statutDetaille === 'EN_COURS' || 
          r.statutDetaille === 'EN_CHARGE' || 
          r.statutDetaille === 'EN_ATTENTE'
        ).length;
      case 'EN_ATTENTE':
        return this.reservations.filter(r => r.statutDetaille === 'EN_ATTENTE').length;
      case 'EN_COURS':
        return this.reservations.filter(r => r.statutDetaille === 'EN_COURS').length;
      case 'EN_CHARGE':
        return this.reservations.filter(r => r.statutDetaille === 'EN_CHARGE').length;
      case 'TERMINEE':
        return this.reservations.filter(r => r.statutDetaille === 'TERMINEE').length;
      case 'ANNULEE':
        return this.reservations.filter(r => r.statutDetaille === 'ANNULEE').length;
      case 'EXPIREE':
        return this.reservations.filter(r => r.statutDetaille === 'EXPIREE').length;
      default:
        return this.reservations.filter(r => r.statut === status).length;
    }
  }

  sortReservations(): void {
    this.filteredReservations.sort((a, b) => {
      switch (this.sortBy) {
        case 'dateDesc':
          return new Date(b.dateReservation).getTime() - new Date(a.dateReservation).getTime();
        case 'dateAsc':
          return new Date(a.dateReservation).getTime() - new Date(b.dateReservation).getTime();
        case 'station':
          return (a.station?.name || '').localeCompare(b.station?.name || '');
        case 'vehicule':
          return a.typeVehicule.localeCompare(b.typeVehicule);
        default:
          return 0;
      }
    });
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredReservations.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    this.updatePaginatedReservations();
  }

  private updatePaginatedReservations(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReservations = this.filteredReservations.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedReservations();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDetailedStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'EN_CHARGE': 'En charge',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée',
      'EXPIREE': 'Expirée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'waiting',
      'EN_COURS': 'in-progress',
      'EN_CHARGE': 'charging',
      'TERMINEE': 'completed',
      'ANNULEE': 'cancelled',
      'EXPIREE': 'expired'
    };
    return classes[status] || '';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'EN_ATTENTE': 'fa-clock',
      'EN_COURS': 'fa-play-circle',
      'EN_CHARGE': 'fa-bolt',
      'TERMINEE': 'fa-check-circle',
      'ANNULEE': 'fa-times-circle',
      'EXPIREE': 'fa-exclamation-triangle'
    };
    return icons[status] || 'fa-question-circle';
  }

  getChargingProgress(reservation: Reservation): number {
    const status = reservation.statutDetaille || 'EN_ATTENTE';
    
    if (status === 'TERMINEE') return 100;
    if (status === 'ANNULEE' || status === 'EXPIREE') return 0;
    
    const now = new Date();
    const start = new Date(reservation.dateReservation);
    const end = new Date(reservation.dateFinPrevue);
    
    if (now < start) return 0;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    return Math.round(progress);
  }

  getTimeRemaining(reservation: Reservation): number {
    const status = reservation.statutDetaille || 'EN_ATTENTE';
    
    if (status === 'TERMINEE' || status === 'ANNULEE' || status === 'EXPIREE') return 0;
    
    const now = new Date();
    
    if (status === 'EN_ATTENTE') {
      const start = new Date(reservation.dateReservation);
      const remaining = start.getTime() - now.getTime();
      return Math.max(0, Math.round(remaining / (1000 * 60)));
    }
    
    const end = new Date(reservation.dateFinPrevue);
    const remaining = end.getTime() - now.getTime();
    return Math.max(0, Math.round(remaining / (1000 * 60)));
  }

  getElapsedTime(reservation: Reservation): number {
    const status = reservation.statutDetaille || 'EN_ATTENTE';
    
    if (status === 'EN_ATTENTE') return 0;
    
    const now = new Date();
    const start = reservation.dateDebut ? new Date(reservation.dateDebut) : new Date(reservation.dateReservation);
    const elapsed = now.getTime() - start.getTime();
    
    return Math.max(0, Math.round(elapsed / (1000 * 60)));
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }

  navigateToStation(reservation: Reservation): void {
    if (reservation.station?.latitude && reservation.station?.longitude) {
      const url = `https://maps.google.com/maps?daddr=${reservation.station.latitude},${reservation.station.longitude}`;
      window.open(url, '_blank');
    } else {
      this.notificationService.showWarning('Coordonnées de la station non disponibles');
    }
  }

  canCancelReservation(reservation: Reservation): boolean {
    const status = reservation.statutDetaille || 'EN_ATTENTE';
    
    if (status === 'TERMINEE' || status === 'ANNULEE' || status === 'EXPIREE') {
      return false;
    }

    if (status === 'EN_ATTENTE' || status === 'EN_COURS') {
      return true;
    }

    return false;
  }

  cancelReservation(reservation: Reservation): void {
    this.reservationToCancel = reservation;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.reservationToCancel = null;
  }

  async confirmCancelReservation(): Promise<void> {
    if (!this.reservationToCancel) return;

    try {
      this.reservationToCancel.cancelling = true;

      await this.reservationService.cancelReservation(this.reservationToCancel.id);
      this.notificationService.showSuccess('Réservation annulée avec succès');
      this.closeCancelModal();
      
      this.loadReservations();

    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      this.notificationService.showError('Impossible d\'annuler la réservation');
    } finally {
      if (this.reservationToCancel) {
        this.reservationToCancel.cancelling = false;
      }
    }
  }

  async repeatReservation(reservation: Reservation): Promise<void> {
    try {
      this.router.navigate(['/stations'], {
        queryParams: {
          stationId: reservation.stationId,
          vehicleType: reservation.typeVehicule,
          duration: reservation.tempsEstimeMinutes,
          targetCharge: reservation.pourcentageChargeSouhaite
        }
      });
    } catch (error) {
      console.error('Erreur lors de la répétition:', error);
      this.notificationService.showError('Impossible de répéter la réservation');
    }
  }

  async pay(reservation: any) {
    if (!reservation?.id) {
      return;
    }
    this.paymentErrors[reservation.id] = '';
    this.loadingPaymentId = reservation.id;

    try {
      await this.paymentService.startCheckout(reservation.id);
    } catch (e: any) {
      this.paymentErrors[reservation.id] = e?.message || 'Échec du paiement';
    } finally {
      this.loadingPaymentId = null;
    }
  }

  goToStations(): void {
    this.router.navigate(['/stations']);
  }

  contactSupport(reservation: Reservation): void {
    this.router.navigate(['/support'], {
      queryParams: {
        type: 'expired_reservation',
        reservationId: reservation.id,
        stationId: reservation.stationId
      }
    });
  }

  trackByReservation(index: number, reservation: Reservation): number {
    return reservation.id;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onSearch(): void {
    console.log('Recherche :', this.searchTerm);
  }

  toggleDarkMode(): void {
    console.log('Mode sombre activé');
  }

  findMyLocation(): void {
    console.log('Recherche de la position...');
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
    this.activeRoute = route;
  }

  navigateToProfile() {
    this.router.navigate(['/profile'])
  }

  navigateToBookings(): void {
    this.navigateTo('bookings');
  }

  navigateToPayments(): void {
    this.navigateTo('wallet');
  }

  navigateToSettings(): void {
    this.navigateTo('settings');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get co2Saved(): number {
    return 12.5;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    console.log('Notifications toggled:', this.showNotifications);
  }
}