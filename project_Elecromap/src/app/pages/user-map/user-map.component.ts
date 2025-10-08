import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-user-map',
  templateUrl: './user-map.component.html',
  styleUrls: ['./user-map.component.scss']
})
export class UserMapComponent implements OnInit, AfterViewInit {
  sidebarCollapsed = false;
  showProfileDropdown = false;
  searchTerm = '';
  favoritesCount = 2;
  upcomingBookings = 1;
  userName = 'Utilisateur';
  userAvatar = '';
  userStatus = 'En ligne';
  activeRoute = '';
  showMapOnly: boolean = false;
  mapFullScreen: boolean = false;

  private map!: L.Map;
  trajet: any = null;
  messageTrajet: string = '';
  notificationCount = 3;

  

  showNotifications = false;

toggleNotifications(): void {
  this.showNotifications = !this.showNotifications;
  console.log('Notifications toggled:', this.showNotifications);
}

  constructor(private router: Router,
  private authService: AuthService,

  ) {}

  ngOnInit(): void {
    this.activeRoute = this.router.url.split('/')[1];
    const navigation = this.router.getCurrentNavigation();
    this.trajet = navigation?.extras?.state?.['trajet'];
      this.messageTrajet = "✅ Ceci est un message de test statique"; // 👈 Ajout test
        this.userName = this.authService.getUserFullName();


  }

  ngAfterViewInit(): void {
  if (this.trajet) {
  this.initMap(() => {
    this.displayPlannedRoute(this.trajet);
    this.notifierUtilisateur(this.trajet); // ✅ ajout ici
  });
}
} 

notifierUtilisateur(trajet: any): void {
  const charge = trajet.chargeActuelle;
  const autonomieParPourcentage = 2;
  const autonomie = charge * autonomieParPourcentage;

  const station = trajet.stationsSuggerees[0];

  this.messageTrajet = `⚡ Votre charge permet ${autonomie} km. Arrêtez-vous à la station recommandée : ${station.name}`;
  
  console.log('✅ Message généré :', this.messageTrajet); // 👈 Ajout

  setTimeout(() => {
    this.messageTrajet = '';
  }, 10000);
}



  initMap(callback?: () => void): void {
    if (!navigator.geolocation) {
      alert('La géolocalisation n’est pas supportée par ce navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      this.map = L.map('mapuser').setView([latitude, longitude], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      const userIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      L.marker([latitude, longitude], { icon: userIcon })
        .addTo(this.map)
        .bindPopup('Vous êtes ici')
        .openPopup();

      if (callback) callback();
    }, () => {
      alert('Impossible d’obtenir votre position');
    });
  }

  displayPlannedRoute(trajet: any): void {
    console.log('➡️ Trajet reçu :', trajet);

    const waypoints = [
      L.latLng(trajet.depart.lat, trajet.depart.lng),
      ...trajet.stationsSuggerees.map((s: any) => L.latLng(s.latitude, s.longitude)),
      L.latLng(trajet.destination.lat, trajet.destination.lng)
    ];

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      createMarker: (i: number, wp: any, nWps: number) => {
        return L.marker(wp.latLng);
      }
    }).addTo(this.map);

    const stationIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/10485/10485549.png',
      iconSize: [35, 35],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30]
    });

    trajet.stationsSuggerees.forEach((station: any) => {
      L.marker([station.latitude, station.longitude], { icon: stationIcon })
        .addTo(this.map)
        .bindPopup(`<b>Recharge ici ⚡</b><br>${station.name}`);
    });
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

  navigateToProfile(): void {
    this.navigateTo('profile');
  }

  navigateToBookings(): void {
    this.navigateTo('mes-reservations');
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
}
