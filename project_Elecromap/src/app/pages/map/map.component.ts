import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges,OnDestroy, HostListener } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { ActivatedRoute } from '@angular/router';
import { ChargingStationService } from '../../services/charging-station.service';
import { ChargingStation } from '../../models/charging-station.model';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
}
interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
}
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
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnChanges {
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
  
  private map!: L.Map;
  private stations: ChargingStation[] = [];
  private routingControl: any;

  @Output() positionSelected = new EventEmitter<{ lat: number; lng: number }>();
  @Input() centerOn: { lat: number, lng: number } | null = null;
  @Input() adminView: boolean = true;

  @Input() trajet: any;  // <-- le trajet à afficher




  constructor(
    private stationService: ChargingStationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

 ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const from = params['from'];
    const to = params['to'];
    const charge = params['charge'];

    console.log('Départ:', from);
    console.log('Destination:', to);
    console.log('Charge actuelle:', charge);

    this.initMap(() => {
      if (from && to) {
        this.afficherItineraire(from, to);
      }
    });
  });
    this.route.queryParams.subscribe(params => { /* ... */ });
  this.calculateNotificationCount();
}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['centerOn'] && this.centerOn && this.map) {
      this.map.setView([this.centerOn.lat, this.centerOn.lng], 16); 
    }
  }
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
  private afficherItineraire(from: string, to: string): void {
  if (!this.map || !L.Routing) return;

  // Supprimer l'ancien itinéraire s'il existe
  if (this.routingControl) {
    this.map.removeControl(this.routingControl);
  }

  // Parsing des coordonnées
  const fromParts = from.split(',');
  const toParts = to.split(',');

  const fromLatLng = L.latLng(parseFloat(fromParts[0]), parseFloat(fromParts[1]));
  const toLatLng = L.latLng(parseFloat(toParts[0]), parseFloat(toParts[1]));

  // Vérification des coordonnées
  if (
    isNaN(fromLatLng.lat) || isNaN(fromLatLng.lng) ||
    isNaN(toLatLng.lat) || isNaN(toLatLng.lng)
  ) {
    console.error('❌ Coordonnées invalides :', fromLatLng, toLatLng);
    alert("Les coordonnées du trajet sont invalides.");
    return;
  }
  

  console.log("🚩 FROM:", fromLatLng);
  console.log("🏁 TO:", toLatLng);

  // Ajout du contrôle de routage
  this.routingControl = L.Routing.control({
    waypoints: [fromLatLng, toLatLng],
    routeWhileDragging: false,
    language: 'fr',
    show: false,
    addWaypoints: false,
    createMarker: function (i: number, wp: any, nWps: number) {
      return L.marker(wp.latLng);
    }
  }).addTo(this.map);

  // Zoom automatique sur l’itinéraire
  this.routingControl.on('routesfound', (e: any) => {
    const route = e.routes[0];
    if (route && route.bounds) {
      this.map.fitBounds(route.bounds);
    }
  });

  // Gestion des erreurs de routage
  this.routingControl.on('routingerror', (err: any) => {
    console.error('❌ Routing error:', err);
    alert("Erreur lors du calcul de l'itinéraire.");
  });
}
markAllAsRead(): void {
  this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  this.calculateNotificationCount();
}

private calculateNotificationCount(): void {
  this.notificationCount = this.notifications.filter(n => !n.read).length;
}

// private initMap(callback?: () => void): void {
//     if (!navigator.geolocation) {
//       alert('La géolocalisation n’est pas supportée par ce navigateur.');
//       return;
//     }

//     navigator.geolocation.getCurrentPosition((position) => {
//       const { latitude, longitude } = position.coords;

//       this.map = L.map('map').setView([latitude, longitude], 10);

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '&copy; OpenStreetMap contributors'
//       }).addTo(this.map);

//       const userIcon = L.icon({
//         iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
//         shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//       });

//       L.marker([latitude, longitude], { icon: userIcon })
//         .addTo(this.map)
//         .bindPopup('Vous êtes ici')
//         .openPopup();

//       if (this.adminView) {
//         this.map.on('click', (e: L.LeafletMouseEvent) => {
//           const { lat, lng } = e.latlng;
//           this.positionSelected.emit({ lat, lng });

//           L.marker([lat, lng])
//             .addTo(this.map)
//             .bindPopup(`Nouvelle station ici<br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
//             .openPopup();
//         });
//       }

//       this.loadStations();
//           if (callback) callback(); // <-- Appel ici une fois la carte prête

//     }, () => {
//       alert('Impossible d’obtenir votre position');
//     });
//   }
private initMap(callback?: () => void): void {
  const buildMap = (lat: number, lng: number) => {
    this.map = L.map('map').setView([lat, lng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Clic sur la carte -> on émet la position
    if (this.adminView) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.positionSelected.emit({ lat, lng });

        L.marker([lat, lng]).addTo(this.map)
          .bindPopup(`Nouvelle station ici<br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
          .openPopup();
      });
    }

    this.loadStations();
    if (callback) callback();
  };

  // Géoloc avec fallback si refusée
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => buildMap(pos.coords.latitude, pos.coords.longitude),
      _   => buildMap(34.0, 9.0) // centre par défaut (Tunisie)
    );
  } else {
    buildMap(34.0, 9.0);
  }
}

  private loadStations(): void {
    this.stationService.getAll().subscribe({
      next: (stations) => {
        this.stations = stations;
        this.addStationsToMap();
      },
      error: (err) => {
        console.error('Erreur chargement stations :', err);
      }
    });
  }

  private addStationsToMap(): void {
    const icon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/6677/6677618.png',
      iconSize: [40, 40],
      iconAnchor: [15, 30],
    });

    for (const s of this.stations) {
      if (s.latitude && s.longitude) {
        L.marker([s.latitude, s.longitude], { icon })
          .addTo(this.map)
          .bindPopup(`
            <b>${s.name}</b><br>
            Type : ${s.type ?? 'Non défini'}<br>
            ${s.description ? 'Description : ' + s.description + '<br>' : ''}
            <span style="color:${s.available ? 'green' : 'red'}">
              ${s.available ? '✅ Disponible' : '❌ Indisponible'}
            </span><br>
            <span style="color:${s.working ? 'green' : 'red'}">
              ${s.working ? '✅ Fonctionnelle' : '❌ En panne'}
            </span>
          `);
      }
    }
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
}
