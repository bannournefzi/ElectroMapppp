import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { CarType } from '../../models/car-type.model';

interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
}

type NotificationType = 'success' | 'warning' | 'error' | 'info';
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  type: NotificationType;
  read: boolean;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  // ===== UI state =====
  sidebarCollapsed = false;
  darkMode = false;
  showNotifications = false;
  showProfileDropdown = false;
  isLoading = false;
  isRefreshing = false;
  searchQuery = '';
  activeRoute: string = 'dashboard';

  showPlanTripModal = false;


   // Data
  stationsCount: number = 1247;
  totalRevenue: number = 45672;
  revenueGrowth: number = 15;
  newUsersToday: number = 24;
  activeUsersMonth: number = 5647;

  // ===== Counters / badges =====
  notificationCount = 0;   // unread notifications
  alertsCount = 0;         // warnings + errors
  favoritesCount = 2;
  upcomingBookings = 1;
  co2Saved = 42;
  usersCount: number = 8924;


  // ===== Header user =====
  userAvatar?: string;
  userName: string = 'John Doe';
  userStatus: string = 'Connecté';
  userProfile: UserProfile = {
    name: 'Admin User',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=667eea&color=fff&size=44',
    isOnline: true
  };

  // ===== Dashboard data =====
  weatherData = { temperature: 27, location: 'Tunis' };
  monthlyStats = { sessions: 8, sessionsChange: +12, energy: 53, energyChange: 10, spending: 42, spendingChange: 4, co2Saved: 18 };

  // ===== Notifications =====
  notifications: Notification[] = [
    { id: 'n1', title: 'Réservation confirmée', message: 'Station Centre à 16:00', time: 'il y a 2 h', icon: 'fa-calendar-check', type: 'success', read: false },
    { id: 'n2', title: 'Paiement reçu', message: '9.20 TND', time: 'hier', icon: 'fa-credit-card', type: 'info', read: true },
    { id: 'n3', title: 'Station hors ligne', message: 'Station Lac (maintenance)', time: 'il y a 5 min', icon: 'fa-plug', type: 'warning', read: false }
  ];

  // ===== Users data =====
  users: User[] = [];
  allUsers: User[] = [];
  error: string | null = null;

  filterStatus: string = 'all';
  filterRole: string = 'all';

  isAddModalOpen = false;
  isEditModalOpen = false;
  selectedUser: User | null = null;
  editedUser: User | null = null;

  newUser: User = this.getEmptyUser();

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateCurrentRoute();
    this.calculateNotificationCount();
    this.calculateAlertsCount();
    this.loadUsers();
  }

  // ===== Routing / layout =====
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleDarkMode(): void {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container') && !target.closest('.profile-container')) {
      this.showNotifications = false;
      this.showProfileDropdown = false;
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      // Optionally mark all as read when opening
      // this.markAllAsRead();
    }
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  updateCurrentRoute(): void {
    const url = this.router.url.replace(/^\//, '');
    // map real routes back to sidebar keys if needed
    const reverseMap: Record<string, string> = {
      'mes-reservations': 'bookings'
    };
this.activeRoute = reverseMap[url] ?? (url || 'dashboard');
  }
  onSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  console.log(value);
}

  navigateTo(route: string): void {
    this.activeRoute = route;
    const map: Record<string, string> = {
      dashboard: '/dashboard',
      mapuser: '/mapuser',
      stations: '/stations',
      favorites: '/favorites',
      history: '/history',
      bookings: '/mes-reservations',
      wallet: '/wallet',
      support: '/support',
      settings: '/settings'
    };
    this.router.navigate([map[route] ?? `/${route}`]);
  }

  // ===== Quick actions / plan trip =====
  planTrip(): void { this.showPlanTripModal = true; }
  onTrajetPlanifie(trajet: any): void {
    this.router.navigate(['/map'], { queryParams: { from: trajet.depart, to: trajet.destination, charge: trajet.charge } });
    this.showPlanTripModal = false;
  }
  onFermerModal(): void { this.showPlanTripModal = false; }

  findMyLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      console.log('Ma position :', pos.coords.latitude, pos.coords.longitude);
    });
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


 

  // ===== Notifications helpers =====
  markAllAsRead(): void {
    this.notifications = this.notifications.map((n): Notification => ({ ...n, read: true }));
    this.calculateNotificationCount();
  }

  calculateNotificationCount(): void {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  calculateAlertsCount(): void {
    this.alertsCount = this.notifications.filter(n => n.type === 'warning' || n.type === 'error').length;
  }

  // ===== Users: load & filter =====
  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.getAll().subscribe({
      next: (users: User[]) => {
        this.allUsers = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.error = 'Impossible de charger les utilisateurs';
        this.isLoading = false;
      }
    });
  }

  reloadUsers(): void { this.loadUsers(); }

  applyFilters(): void {
    this.users = this.allUsers.filter((user: User) => {
      const matchStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && user.enabled && !user.accountLocked) ||
        (this.filterStatus === 'inactive' && !user.enabled) ||
        (this.filterStatus === 'locked' && user.accountLocked);

      const matchRole =
        this.filterRole === 'all' ||
        user.roles?.some(role => role.name === this.filterRole);

      return matchStatus && matchRole;
    });
  }

  // ===== Users: UI helpers =====
  getActiveUsersCount(): number {
    return this.allUsers.filter(u => u.enabled && !u.accountLocked).length;
  }

  getAdminUsersCount(): number {
    return this.allUsers.filter(u => u.roles?.some(r => r.name === 'ROLE_ADMIN')).length;
  }

  trackByUserId(index: number, user: User): any {
    return user.id ?? index;
  }

  getUserAvatar(user: User): string {
    const name = `${user.firstName} ${user.lastName}`;
    const backgroundColor = user.enabled ? '4285f4' : 'a0aec0';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${backgroundColor}&color=fff&size=60`;
  }

  getUserStatusClass(user: User): string {
    if (user.accountLocked) return 'status-locked';
    if (!user.enabled) return 'status-inactive';
    return 'status-active';
  }

  getRoleClass(roleName: string): string {
    return roleName === 'ROLE_ADMIN' ? 'role-admin' : 'role-user';
  }

  getRoleLabel(roleName: string): string {
    return roleName === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur';
  }

  getRoleNames(user: User): string {
    return user.roles?.map(r => r.name).join(', ') || 'Aucun rôle';
  }

  // ===== Modals =====
  openAddUserModal(): void {
    this.newUser = this.getEmptyUser();
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.newUser = this.getEmptyUser();
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.editedUser = { ...user };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedUser = null;
    this.editedUser = null;
  }

  // ===== CRUD =====
  createUser(): void {
    if (!this.isValidUser(this.newUser)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const selectedRole = this.newUser.roleValue === 2
      ? { id: 2, name: 'ROLE_ADMIN' }
      : { id: 1, name: 'ROLE_USER' };

    const payload: User = { ...this.newUser, roles: [selectedRole] };

    this.userService.createUser(payload).subscribe({
      next: (user: User) => {
        this.allUsers.push(user);
        this.applyFilters();
        this.closeAddModal();
        this.showSuccessMessage('Utilisateur créé avec succès');
      },
      error: (err: any) => {
        console.error('Erreur lors de la création:', err);
        this.showErrorMessage('Erreur lors de la création de l\'utilisateur');
      }
    });
  }

  saveUser(): void {
    if (!this.editedUser || !this.editedUser.id) return;
    if (!this.isValidUser(this.editedUser, true)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.userService.updateUser(this.editedUser).subscribe({
      next: (updatedUser: User) => {
        const i = this.allUsers.findIndex(u => u.id === updatedUser.id);
        if (i !== -1) this.allUsers[i] = updatedUser;
        this.applyFilters();
        this.closeEditModal();
        this.showSuccessMessage('Utilisateur modifié avec succès');
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise à jour:', err);
        this.showErrorMessage('Erreur lors de la modification de l\'utilisateur');
      }
    });
  }

  deleteUser(id: number): void {
    const user = this.allUsers.find(u => u.id === id);
    const userName = user ? `${user.firstName} ${user.lastName}` : 'cet utilisateur';

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.allUsers = this.allUsers.filter(u => u.id !== id);
        this.applyFilters();
        this.showSuccessMessage('Utilisateur supprimé avec succès');
      },
      error: (err: any) => {
        console.error('Erreur lors de la suppression:', err);
        this.showErrorMessage('Erreur lors de la suppression de l\'utilisateur');
      }
    });
  }

  toggleUserStatus(user: User): void {
    if (!user.id) return;
    const updatedUser = { ...user, enabled: !user.enabled, lastModifiedDate: new Date().toISOString() };

    this.userService.updateUser(updatedUser).subscribe({
      next: (result: User) => {
        const i = this.allUsers.findIndex(u => u.id === result.id);
        if (i !== -1) this.allUsers[i] = result;
        this.applyFilters();
        this.showSuccessMessage(`Utilisateur ${result.enabled ? 'activé' : 'désactivé'} avec succès`);
      },
      error: (err: any) => {
        console.error('Erreur lors du changement de statut:', err);
        this.showErrorMessage('Erreur lors du changement de statut');
      }
    });
  }

  viewUserDetails(user: User): void {
    alert(`Détails de ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nRôles: ${this.getRoleNames(user)}`);
  }

  // ===== Utils =====
  getEmptyUser(): User {
    return {
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      carType: CarType.OTHER,
      phone: '',
      password: '',
      roles: [],
      enabled: true,
      accountLocked: false,
      creationDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      roleValue: 1
    };
  }

  isValidUser(user: User, isEdit: boolean = false): boolean {
    const basic =
      !!user.firstName?.trim() &&
      !!user.lastName?.trim() &&
      !!user.email?.trim() &&
      !!user.dateOfBirth;

    if (!isEdit && (!user.password || user.password.trim().length < 6)) return false;
    return basic;
  }

  showSuccessMessage(message: string): void { alert(message); }
  showErrorMessage(message: string): void { alert(message); }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  // Buttons used in cards
  quickChargeNow(): void { this.router.navigate(['/stations'], { queryParams: { available: true } }); }
  viewBookings(): void { this.router.navigate(['/mes-reservations']); }
  viewHistory(): void { this.router.navigate(['/history']); }
  viewAllStations(): void { this.router.navigate(['/stations']); }
  toggleFilters(): void { /* stub for filters toggle in UI */ }
  navigateToReservation(stationId: number): void { this.router.navigate(['/reservation', stationId]); }
}
