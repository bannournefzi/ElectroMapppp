import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

interface QuickStat {
  icon: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  type: string;
  link: string;
}

interface PerformanceMetric {
  label: string;
  value: string;
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'new-user' | 'station-online' | 'maintenance' | 'error';
  status: 'success' | 'pending' | 'failed';
}

interface StationStatus {
  icon: string;
  label: string;
  count: number;
  percentage: number;
  type: 'online' | 'offline' | 'maintenance' | 'available';
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

interface StationFilter {
  key: string;
  label: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  
  // UI State
  sidebarCollapsed: boolean = false;
  darkMode: boolean = false;
  showNotifications: boolean = false;
  showProfileDropdown: boolean = false;
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  searchQuery: string = '';
  activeRoute: string = 'dashboard';
  
  // Time
  currentDate: Date = new Date();
  currentTime: Date = new Date();
  private timeSubscription?: Subscription;

  // Filters
  activeStationFilter: string = 'all';
  revenueTimeframe: string = 'month';

  // Data
  notificationCount: number = 3;
  alertsCount: number = 2;
  stationsCount: number = 1247;
  usersCount: number = 8924;
  totalRevenue: number = 45672;
  revenueGrowth: number = 15;
  newUsersToday: number = 24;
  activeUsersMonth: number = 5647;

  // User Profile
  userProfile: UserProfile = {
    name: 'Admin User',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=667eea&color=fff&size=44',
    isOnline: true
  };

  // Quick Stats Data
  quickStats: QuickStat[] = [
    {
      icon: 'fas fa-charging-station',
      label: 'Bornes Actives',
      value: 1247,
      change: 12,
      trend: 'up',
      type: 'primary',
      link: '/stations'
    },
    {
      icon: 'fas fa-users',
      label: 'Utilisateurs',
      value: 8924,
      change: 8,
      trend: 'up',
      type: 'success',
      link: '/users'
    },
    {
      icon: 'fas fa-euro-sign',
      label: 'Revenus',
      value: 45672,
      change: 15,
      trend: 'up',
      type: 'warning',
      link: '/analytics'
    },
    {
      icon: 'fas fa-bolt',
      label: 'Sessions',
      value: 12456,
      change: 3,
      trend: 'down',
      type: 'danger',
      link: '/analytics'
    }
  ];

  // Performance Metrics
  performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Disponibilité du réseau',
      value: '99.8%',
      percentage: 99.8,
      status: 'excellent'
    },
    {
      label: 'Temps de réponse moyen',
      value: '2.3s',
      percentage: 85,
      status: 'good'
    },
    {
      label: 'Taux de satisfaction',
      value: '94.2%',
      percentage: 94.2,
      status: 'excellent'
    },
    {
      label: 'Incidents résolus',
      value: '89.5%',
      percentage: 89.5,
      status: 'good'
    }
  ];

  // Recent Activities
  recentActivities: RecentActivity[] = [
    {
      id: '1',
      icon: 'fas fa-user-plus',
      title: 'Nouvel utilisateur inscrit',
      description: 'Marie Dubois s\'est inscrite',
      timestamp: new Date(Date.now() - 5 * 60000),
      type: 'new-user',
      status: 'success'
    },
    {
      id: '2',
      icon: 'fas fa-charging-station',
      title: 'Borne mise en ligne',
      description: 'Station Paris-15 opérationnelle',
      timestamp: new Date(Date.now() - 12 * 60000),
      type: 'station-online',
      status: 'success'
    },
    {
      id: '3',
      icon: 'fas fa-wrench',
      title: 'Maintenance programmée',
      description: 'Station Lyon-02 en maintenance',
      timestamp: new Date(Date.now() - 60 * 60000),
      type: 'maintenance',
      status: 'pending'
    },
    {
      id: '4',
      icon: 'fas fa-exclamation-triangle',
      title: 'Erreur détectée',
      description: 'Problème de connexion Station Marseille-03',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      type: 'error',
      status: 'failed'
    }
  ];

  // Station Status
  stationStatus: StationStatus[] = [
    {
      icon: 'fas fa-check-circle',
      label: 'En ligne',
      count: 1156,
      percentage: 92.7,
      type: 'online'
    },
    {
      icon: 'fas fa-times-circle',
      label: 'Hors ligne',
      count: 23,
      percentage: 1.8,
      type: 'offline'
    },
    {
      icon: 'fas fa-tools',
      label: 'Maintenance',
      count: 45,
      percentage: 3.6,
      type: 'maintenance'
    },
    {
      icon: 'fas fa-clock',
      label: 'Disponible',
      count: 23,
      percentage: 1.9,
      type: 'available'
    }
  ];

  // Station Filters
  stationFilters: StationFilter[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'online', label: 'En ligne' },
    { key: 'offline', label: 'Hors ligne' },
    { key: 'maintenance', label: 'Maintenance' }
  ];

  // Notifications
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
    },
    {
      id: '3',
      title: 'Rapport mensuel',
      message: 'Le rapport mensuel est disponible',
      time: 'Il y a 1h',
      icon: 'fas fa-file-alt',
      type: 'info',
      read: true
    }
  ];

  // Alerts
  alerts: Alert[] = [
    {
      id: '1',
      title: 'Borne en panne',
      message: 'La station Nice-01 ne répond plus depuis 30 minutes',
      timestamp: new Date(Date.now() - 30 * 60000),
      severity: 'critical',
      icon: 'fas fa-exclamation-triangle'
    },
    {
      id: '2',
      title: 'Surcharge réseau',
      message: 'Pic d\'utilisation détecté dans la région PACA',
      timestamp: new Date(Date.now() - 45 * 60000),
      severity: 'warning',
      icon: 'fas fa-chart-line'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.startTimeUpdates();
    this.loadDashboardData();
    
    // Check for saved preferences
    this.loadUserPreferences();
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  // Lifecycle Methods
  private initializeComponent(): void {
    this.updateCurrentRoute();
    this.calculateNotificationCount();
    this.calculateAlertsCount();
  }

  private startTimeUpdates(): void {
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
    
    // Update date every minute
    interval(60000).subscribe(() => {
      this.currentDate = new Date();
    });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Simulate API calls
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  private loadUserPreferences(): void {
    const savedTheme = localStorage.getItem('admin-theme');
    const savedSidebar = localStorage.getItem('admin-sidebar-collapsed');
    
    if (savedTheme === 'dark') {
      this.darkMode = true;
      document.body.classList.add('dark');
    }
    
    if (savedSidebar === 'true') {
      this.sidebarCollapsed = true;
    }
  }

  private updateCurrentRoute(): void {
    // This would typically come from Router service
    this.activeRoute = 'dashboard';
  }

  private calculateNotificationCount(): void {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  private calculateAlertsCount(): void {
    this.alertsCount = this.alerts.length;
  }

  // UI Interaction Methods
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
  onDocumentClick(event: any): void {
    // Close dropdowns when clicking outside
    if (!event.target.closest('.notification-container') && !event.target.closest('.profile-container')) {
      this.showNotifications = false;
      this.showProfileDropdown = false;
    }
  }

  // Navigation Methods
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.activeRoute = route.substring(1) || 'dashboard';
    this.showNotifications = false;
    this.showProfileDropdown = false;
  }

  logout(): void {
    // Clear user session
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('admin-theme');
    localStorage.removeItem('admin-sidebar-collapsed');
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  // Search Methods
  onSearch(event: any): void {
    const query = event.target.value;
    console.log('Searching for:', query);
    
    // Implement search logic here
    // You could filter data or make API calls
  }

  // Data Refresh Methods
  refreshPerformance(): void {
    this.isRefreshing = true;
    
    // Simulate API call
    setTimeout(() => {
      // Update performance metrics with new data
      this.performanceMetrics = this.performanceMetrics.map(metric => ({
        ...metric,
        value: this.generateRandomMetricValue(metric.label),
        percentage: Math.random() * 100
      }));
      
      this.isRefreshing = false;
    }, 2000);
  }

  private generateRandomMetricValue(label: string): string {
    switch (label) {
      case 'Disponibilité du réseau':
        return (98 + Math.random() * 2).toFixed(1) + '%';
      case 'Temps de réponse moyen':
        return (1 + Math.random() * 3).toFixed(1) + 's';
      case 'Taux de satisfaction':
        return (90 + Math.random() * 10).toFixed(1) + '%';
      case 'Incidents résolus':
        return (85 + Math.random() * 15).toFixed(1) + '%';
      default:
        return '0%';
    }
  }

  // Station Filter Methods
  setStationFilter(filterKey: string): void {
    this.activeStationFilter = filterKey;
    
    // Filter station status based on selected filter
    // This would typically involve API calls or data filtering
    console.log('Filtering stations by:', filterKey);
  }

  // Revenue Chart Methods
  updateRevenueChart(): void {
    console.log('Updating revenue chart for timeframe:', this.revenueTimeframe);
    
    // Update revenue data based on selected timeframe
    switch (this.revenueTimeframe) {
      case 'week':
        this.totalRevenue = 12500;
        this.revenueGrowth = 8;
        break;
      case 'month':
        this.totalRevenue = 45672;
        this.revenueGrowth = 15;
        break;
      case 'year':
        this.totalRevenue = 567890;
        this.revenueGrowth = 23;
        break;
    }
  }

  // Notification Methods
  markAllAsRead(): void {
    this.notifications = this.notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    this.calculateNotificationCount();
  }

  // Alert Methods
  resolveAlert(alertId: string): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
    this.calculateAlertsCount();
    
    // Show success message or handle API call
    console.log('Alert resolved:', alertId);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success':
        return 'fas fa-check-circle';
      case 'pending':
        return 'fas fa-clock';
      case 'failed':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-info-circle';
    }
  }

  // Export Methods
  exportData(): void {
    console.log('Exporting dashboard data...');
    
    // Implement data export logic
    // Could export to CSV, PDF, etc.
    const data = {
      quickStats: this.quickStats,
      performanceMetrics: this.performanceMetrics,
      recentActivities: this.recentActivities,
      stationStatus: this.stationStatus,
      alerts: this.alerts,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility Methods
  formatNumber(num: number): string {
    return new Intl.NumberFormat('fr-FR').format(num);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Il y a quelques secondes';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  }

  // Development helpers (remove in production)
  addTestNotification(): void {
    const testNotification: Notification = {
      id: Date.now().toString(),
      title: 'Test Notification',
      message: 'This is a test notification',
      time: 'À l\'instant',
      icon: 'fas fa-bell',
      type: 'info',
      read: false
    };
    
    this.notifications.unshift(testNotification);
    this.calculateNotificationCount();
  }

  addTestAlert(): void {
    const testAlert: Alert = {
      id: Date.now().toString(),
      title: 'Test Alert',
      message: 'This is a test alert',
      timestamp: new Date(),
      severity: 'warning',
      icon: 'fas fa-exclamation-triangle'
    };
    
    this.alerts.unshift(testAlert);
    this.calculateAlertsCount();
  }
  navigateToProfile() {
    this.router.navigate(['/profile'])
  }
}
