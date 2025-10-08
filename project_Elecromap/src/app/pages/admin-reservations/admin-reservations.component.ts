// admin-reservations.component.ts
import { AdminReservationsService, AdminReservation, AdminReservationStatus } from 'src/app/services/admin-reservations.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
type Statut = 'EN_ATTENTE' | 'EN_COURS' | 'EN_CHARGE' | 'TERMINEE' | 'ANNULEE' | 'EXPIREE';

interface ReservationRow {
  id: number;
  statut: Statut;
  dateReservation: string | Date;
  dateFinPrevue: string | Date;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  icon: string;
}

interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
}

@Component({
  selector: 'app-admin-reservations',
  templateUrl: './admin-reservations.component.html',
  styleUrls: ['./admin-reservations.component.scss']
})
export class AdminReservationsComponent implements OnInit, OnDestroy {
  totalReservations = 0;
  activeReservations = 0;
  completedToday = 0;
  // UI State
  sidebarCollapsed = false;
  darkMode = false;
  showNotifications = false;
  showProfileDropdown = false;
  isLoading = false;
  isRefreshing = false;
  searchQuery = '';
  activeRoute = 'reservations';

  // Time
  currentDate: Date = new Date();
  currentTime: Date = new Date();
  private timeSubscription?: Subscription;

  // Data headers/counters
  notificationCount = 0;
  alertsCount = 0;
  stationsCount = 1247;
  usersCount = 8924;
  totalRevenue = 45672;
  revenueGrowth = 15;
  newUsersToday = 24;
  activeUsersMonth = 5647;

  // User Profile
  userProfile: UserProfile = {
    name: 'Admin User',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=667eea&color=fff&size=44',
    isOnline: true
  };

  // 🔧 AJOUT : notifications & alerts (avec exemples)
  notifications: Notification[] = [
    {
      id: '1',
      title: 'Nouvelle réservation',
      message: 'Une nouvelle réservation a été effectuée',
      time: 'Il y a 2 min',
      icon: 'fas fa-calendar-plus',
      type: 'success',
      read: false
    },
    {
      id: '2',
      title: 'Maintenance requise',
      message: 'Station Toulouse-01 nécessite une maintenance',
      time: 'Il y a 15 min',
      icon: 'fas fa-wrench',
      type: 'warning',
      read: false
    }
  ];

  alerts: Alert[] = [
    {
      id: 'a1',
      title: 'Borne en panne',
      message: 'La station Nice-01 ne répond plus depuis 30 minutes',
      timestamp: new Date(Date.now() - 30 * 60000),
      severity: 'critical',
      icon: 'fas fa-exclamation-triangle'
    }
  ];

  // Reservations
  private destroy$ = new Subject<void>();
  rows: AdminReservation[] = [];
  loading = true;

  // Filters
  q = '';
  status: '' | AdminReservationStatus = '';
  from?: string;
  to?: string;
  stationId?: number;
  userId?: number;

  // Pagination
  page = 0;
  size = 10;
  total = 0;

  // Details modal
  selected: AdminReservation | null = null;
  showDetails = false;

  // Math pour le template
  Math = Math;

  constructor(
    private adminSrv: AdminReservationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.fetch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.timeSubscription?.unsubscribe();
  }

  // =========================
  //   FETCH + PAYMENTS
  // =========================
  fetch(): void {
    this.loading = true;
    this.adminSrv.getAll({
      page: this.page,
      size: this.size,
      q: this.q.trim(),
      status: this.status,
      from: this.from,
      to: this.to,
      stationId: this.stationId,
      userId: this.userId
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        const pageLike = res as any;
        this.rows = pageLike.content ?? pageLike;
        this.total = pageLike.totalElements ?? this.rows.length;
        this.loading = false;
        this.attachPayments();
      },
      error: () => { this.loading = false; }
    });
  }

  attachPayments(): void {
    if (!this.rows?.length) return;
    const calls = this.rows.map(r => this.adminSrv.getPaymentStatus(r.id));
    forkJoin(calls).pipe(takeUntil(this.destroy$)).subscribe(statuses => {
      this.rows = this.rows.map((r, i) => ({ ...r, paiementStatut: (statuses[i] as any) ?? 'NONE' }));
    });
  }

  // =========================
  //   FILTERS / PAGINATION
  // =========================
  resetFilters(): void {
    this.q = '';
    this.status = '';
    this.from = undefined;
    this.to = undefined;
    this.stationId = undefined;
    this.userId = undefined;
    this.page = 0;
    this.fetch();
  }

  onPageChange(p: number): void {
    if (p < 0 || p >= Math.ceil(this.total / this.size)) return;
    this.page = p;
    this.fetch();
  }

  getVisiblePages(): number[] {
    const totalPages = Math.ceil(this.total / this.size);
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(0, this.page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  trackByReservation(index: number, item: AdminReservation): number {
    return item.id;
  }

  getActiveCount(): number {
    return this.rows.filter(r =>
      r.statut === 'EN_COURS' || r.statut === 'EN_CHARGE' || r.statut === 'EN_ATTENTE'
    ).length;
  }

  // =========================
  //   STATUS HELPERS
  // =========================
  getStatusClass(status: AdminReservationStatus): string {
    const classes: Record<AdminReservationStatus, string> = {
      'EN_ATTENTE': 'status-pending',
      'EN_COURS': 'status-progress',
      'EN_CHARGE': 'status-charging',
      'TERMINEE': 'status-completed',
      'ANNULEE': 'status-cancelled',
      'EXPIREE': 'status-expired'
    };
    return classes[status] || 'status-unknown';
  }

  getStatusIcon(status: AdminReservationStatus): string {
    const icons: Record<AdminReservationStatus, string> = {
      'EN_ATTENTE': 'fas fa-clock',
      'EN_COURS': 'fas fa-play',
      'EN_CHARGE': 'fas fa-bolt',
      'TERMINEE': 'fas fa-check',
      'ANNULEE': 'fas fa-times',
      'EXPIREE': 'fas fa-exclamation-triangle'
    };
    return icons[status] || 'fas fa-question';
  }

  getStatusLabel(status: AdminReservationStatus): string {
    const labels: Record<AdminReservationStatus, string> = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'EN_CHARGE': 'En charge',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée',
      'EXPIREE': 'Expirée'
    };
    return labels[status] || status;
  }

  // =========================
  //   PAYMENT HELPERS
  // =========================
  getPaymentClass(status?: string): string {
    const classes: Record<string, string> = {
      'PAID': 'payment-paid',
      'PENDING': 'payment-pending',
      'FAILED': 'payment-failed',
      'REFUNDED': 'payment-refunded',
      'NONE': 'payment-none'
    };
    return classes[status || 'NONE'] || 'payment-unknown';
  }

  getPaymentIcon(status?: string): string {
    const icons: Record<string, string> = {
      'PAID': 'fas fa-check',
      'PENDING': 'fas fa-clock',
      'FAILED': 'fas fa-times-circle',
      'REFUNDED': 'fas fa-undo',
      'NONE': 'fas fa-ban'
    };
    return icons[status || 'NONE'] || 'fas fa-question';
  }

  getPaymentLabel(status?: string): string {
    const labels: Record<string, string> = {
      'PAID': 'Payé',
      'PENDING': 'En attente',
      'FAILED': 'Échoué',
      'REFUNDED': 'Remboursé',
      'NONE': 'Non défini'
    };
    return labels[status || 'NONE'] || (status || 'Non défini');
  }

  // =========================
  //   MODAL
  // =========================
  openDetails(reservation: AdminReservation): void {
    this.selected = reservation;
    this.showDetails = true;
    document.body.classList.add('modal-open');
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selected = null;
    document.body.classList.remove('modal-open');
  }

  // =========================
  //   ACTIONS
  // =========================
  editReservation(reservation: AdminReservation): void {
    console.log('Edit reservation:', reservation);
  }

 
  // =========================
  //   UTIL
  // =========================
  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatMinutes(m: number): string {
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return mm ? `${h}h ${mm}min` : `${h}h`;
    }

  // =========================
  //   UI INTERACTIONS
  // =========================
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('admin-sidebar-collapsed', this.sidebarCollapsed.toString());
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileDropdown = false;
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
    this.showNotifications = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container') && !target.closest('.profile-container')) {
      this.showNotifications = false;
      this.showProfileDropdown = false;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.activeRoute = route.substring(1) || 'reservations';
    this.showNotifications = false;
    this.showProfileDropdown = false;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('admin-theme');
    localStorage.removeItem('admin-sidebar-collapsed');
    this.router.navigate(['/login']);
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    console.log('Searching for:', query);
  }

  // =========================
  //   NOTIFS & ALERTES
  // =========================
  markAllAsRead(): void {
    this.notifications = this.notifications.map((notification: Notification) => ({
      ...notification,
      read: true
    }));
    this.calculateNotificationCount();
  }

  resolveAlert(alertId: string): void {
    this.alerts = this.alerts.filter((alert: Alert) => alert.id !== alertId);
    this.calculateAlertsCount();
    console.log('Alert resolved:', alertId);
  }

  private initializeComponent(): void {
    this.updateCurrentRoute();
    this.calculateNotificationCount();
    this.calculateAlertsCount();
  }

  // 🔧 AJOUT : helpers manquants
  private updateCurrentRoute(): void {
    this.activeRoute = 'reservations';
  }

  private calculateNotificationCount(): void {
    this.notificationCount = this.notifications.filter((n: Notification) => !n.read).length;
  }

  private calculateAlertsCount(): void {
    this.alertsCount = this.alerts.length;
  }
  deleteReservation(reservation: AdminReservation): void {
  if (!reservation?.id) return;

  if (confirm(`Êtes-vous sûr de vouloir supprimer la réservation #${reservation.id} ?`)) {
    this.adminSrv.delete(reservation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Retirer de la liste locale
          this.rows = this.rows.filter(r => r.id !== reservation.id);
          this.total--;
          this.calculateNotificationCount(); // si tu veux notifier
          alert(`Réservation #${reservation.id} supprimée avec succès ✅`);
        },
        error: (err) => {
          console.error('Erreur de suppression', err);
          alert(`Échec de la suppression de la réservation #${reservation.id} ❌`);
        }
      });
  }
}
}
