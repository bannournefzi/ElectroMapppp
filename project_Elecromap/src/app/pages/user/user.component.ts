import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ChargingStationService } from 'src/app/services/charging-station.service';
import { MatDialog } from '@angular/material/dialog';
import { ReservationDialogComponent } from 'src/app/components/reservation-dialog/reservation-dialog.component';





@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  showPlanTripModal: boolean = false;
  
planTrip() {
  this.showPlanTripModal = true;
}

planifierTrajetHandler(trajet: any) {
  this.router.navigate(['/map'], {
    queryParams: {
      from: trajet.depart,
      to: trajet.destination,
      charge: trajet.charge
    }
  });
}
onTrajetPlanifie(trajet: any) {
  this.planifierTrajetHandler(trajet);
}

onFermerModal(): void {
  this.showPlanTripModal = false;
}
navigateToReservation(stationId: number) {
  this.router.navigate(['/reservation', stationId]);
}

viewBookings(): void {
  this.router.navigate(['/mes-reservations']);
}

  // 📌 Navbar
  searchTerm: string = '';
  notificationCount = 3;
  showProfileDropdown = false;
  userAvatar?: string;
  userName: string = 'John Doe';
  userStatus: string = 'Connecté';

  // 📌 Sidebar & Navigation
  sidebarCollapsed = false;
  activeRoute: string = 'dashboard';
  favoritesCount = 2;
  upcomingBookings = 1;
  co2Saved = 42;

  // 📌 Dashboard Data
  weatherData = {
    temperature: 27,
    location: 'Tunis'
  };

  monthlyStats = {
    sessions: 8,
    sessionsChange: +12,
    energy: 53,
    energyChange: 10,
    spending: 42,
    spendingChange: 4,
    co2Saved: 18
  };

  nearbyStations = [
  {
    id: 1, // ✅ ajout essentiel
    name: 'Station Lac 1',
    address: 'Rue du Lac',
    status: 'available',
    distance: 2.4,
    availablePorts: 3,
    totalPorts: 5,
    price: '0.6 TND',
    isFavorite: true
  }
];

  recentActivity = [
    { title: 'Recharge terminée', subtitle: 'Station Lac 1', time: 'Il y a 1h', type: 'charge', amount: '7.2 kWh' },
    { title: 'Paiement effectué', subtitle: '0.6 TND', time: 'Il y a 2h', type: 'payment' }
  ];
  
constructor(
  private authService: AuthService,
  private router: Router,
  private stationService: ChargingStationService,
  private dialog: MatDialog
) {}

ngOnInit(): void {
  this.userName = this.authService.getUserFullName();
  this.getCurrentWeather();
  this.userName = this.authService.getUserFullName();
  this.getNearbyStations();
  
}

getNearbyStations(): void {
  navigator.geolocation.getCurrentPosition(pos => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    this.stationService.getAll().subscribe(stations => {
      // Calcule la distance pour chaque station
      const withDistance = stations.map(station => {
        const distance = this.getDistance(userLat, userLng, station.latitude, station.longitude);
        return { ...station, distance };
      });

      // Trie et sélectionne les 2 plus proches
      this.nearbyStations = withDistance
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 3)
  .map(s => ({
    id: s.id!, // ✅ AJOUT ESSENTIEL
    name: s.name,
    address: s.address ?? 'Adresse inconnue',
    status: s.available ? 'available' : 'full',
    distance: s.distance,
    availablePorts: 3,
    totalPorts: 5,
    price: s.pricePerKwh ? `${s.pricePerKwh.toFixed(2)} TND` : 'Non spécifié',
    isFavorite: false
  }));
    });
  });
}
// Formule de Haversine (distance en km)
getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2)); // en kilomètres
}

toRad(deg: number): number {
  return deg * Math.PI / 180;
}

getCurrentWeather(): void {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Appel météo
      this.fetchWeather(lat, lon);
    }, error => {
      console.error('Erreur de géolocalisation', error);
      this.weatherData = {
        temperature: 27,
        location: 'Tunis'
      };
    });
  }
}

fetchWeather(lat: number, lon: number): void {
  const apiKey = 'b4c3aa5921d7a7a2e91efbbcd15bbc03'; // <- clé propre
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!data.main || !data.name) throw new Error('Réponse météo incomplète');
      this.weatherData = {
        temperature: Math.round(data.main.temp),
        location: data.name
      };
    })
    .catch(error => {
      console.error('❌ Erreur récupération météo :', error.message);
      this.weatherData = { temperature: 37, location: 'Tunis' }; // fallback
    });
}

  // Méthodes utilisées dans le template
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onSearch() {
    console.log('Searching:', this.searchTerm);
  }

  toggleDarkMode() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  console.log('🌙 Thème changé vers:', newTheme);
}


  findMyLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
      console.log('Ma position :', pos.coords.latitude, pos.coords.longitude);
    });
  }

  toggleNotifications() {
    alert('Notifications toggled');
  }

 

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  navigateToProfile() {
    this.router.navigate(['/profile'])
  }
  navigateToBookings() {
  this.router.navigate(['/mes-reservations']);
} 

navigateToPayments() {}
navigateToSettings() {}

  navigateTo(route: string) {
  this.activeRoute = route;
  this.router.navigate(['/' + route]);  
     if (route === 'bookings') {
      this.router.navigate(['/mes-reservations']);
    } else {
      this.router.navigate([`/${route}`]);
    }
  }


 openReservationModal(stationId: number): void {
  this.dialog.open(ReservationDialogComponent, {
    width: '500px',
    data: { stationId }
  });
}


  logout(): void {
  this.authService.logout();
  this.router.navigate(['/login']);
}

  quickChargeNow() {}
  
  toggleFilters() {}
  viewAllStations() {}
  selectStation(station: any) {}
  getStatusText(status: string): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupée';
      case 'full': return 'Indisponible';
      default: return 'Inconnu';
    }
  }

  addToFavorites(station: any) {
    station.isFavorite = !station.isFavorite;
  }

  reserveStation(station: any) {
    alert('Station réservée: ' + station.name);
  }

  viewHistory() {}
  getActivityIcon(type: string): string {
    const icons: any = {
      charge: 'fa-bolt',
      payment: 'fa-credit-card',
      booking: 'fa-calendar-alt',
      favorite: 'fa-heart'
    };
    return icons[type] || 'fa-info-circle';
  }
}
