import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChargingStationService } from '../../services/charging-station.service';
import { ReservationDialogComponent } from  '../../components/reservation-dialog/reservation-dialog.component';
import { ChargingStation, ChargingStationUI } from '../../models/charging-station.model';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-all-stations',
  templateUrl: './all-stations.component.html',
  styleUrls: ['./all-stations.component.scss']
})
export class AllStationsComponent implements OnInit {

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


  // Use UI type everywhere in this component
  stations: ChargingStationUI[] = [];
  allStations: ChargingStationUI[] = [];
  filteredStations: ChargingStationUI[] = [];
  isLoading: boolean = false;

  // Filters
  filterAvailability: string = 'all';
  filterType: string = 'all';
  selectedFilter: string = 'all';

  // User position
  userLocation: { lat: number; lng: number } | null = null;

  stationTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'STANDARD', label: 'Charge normale' },
    { value: 'FAST', label: 'Charge rapide' },
    { value: 'ULTRA_FAST', label: 'Charge ultra rapide' }
  ];

  constructor(
    private authService: AuthService,
    private stationService: ChargingStationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserLocation();
    this.loadStations();
    this.userName = this.authService.getUserFullName();

  }

  // =================== DATA ===================

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (this.allStations.length > 0) {
            this.calculateDistances();
            this.applyFilters();
          }
        },
        (error) => {
          console.warn('Géolocalisation non disponible:', error);
        }
      );
    }
  }

  loadStations(): void {
    this.isLoading = true;
    this.stationService.getAll().subscribe({
      next: (data: ChargingStation[]) => {
        // map backend DTO -> UI model
        this.allStations = data.map(station => ({
          ...station,
          distance: 0,
          isFavorite: this.checkIfFavorite(station.id!)
        }));

        if (this.userLocation) this.calculateDistances();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stations:', err);
        this.isLoading = false;
      }
    });
  }

  calculateDistances(): void {
    if (!this.userLocation) return;

    this.allStations = this.allStations.map(station => ({
      ...station,
      distance: this.calculateDistance(
        this.userLocation!.lat,
        this.userLocation!.lng,
        station.latitude,
        station.longitude
      )
    }));

    this.allStations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  toRad(deg: number): number { return deg * Math.PI / 180; }

  // =================== FILTERS & SEARCH ===================

  applyFilters(): void {
    let filtered = [...this.allStations];

    // Search
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(q) ||
        station.address?.toLowerCase().includes(q)
      );
    }

    // Availability
    switch (this.filterAvailability) {
      case 'available':
        filtered = filtered.filter(station => station.available && station.working);
        break;
      case 'unavailable':
        filtered = filtered.filter(station => !station.available || !station.working);
        break;
      case 'favorites':
        filtered = filtered.filter(station => !!station.isFavorite);
        break;
    }

    // Type
    if (this.filterType !== 'all') {
      filtered = filtered.filter(station => station.type === this.filterType);
    }

    this.filteredStations = filtered;
  }

  onSearch(): void { this.applyFilters(); }

  filterStations(filter: string): void {
    this.filterAvailability = filter;
    this.selectedFilter = filter;
    this.applyFilters();
  }

  onTypeFilterChange(): void { this.applyFilters(); }

  refreshStations(): void { this.loadStations(); }

  // =================== USER ACTIONS ===================

  openReservationModal(stationId: number): void {
    const station = this.findStationById(stationId);
    if (!station) { alert('Station non trouvée'); return; }
    if (!station.available || !station.working) {
      alert('Cette station n\'est pas disponible pour le moment');
      return;
    }

    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      width: '600px',
      data: { 
        stationId: stationId,
        stationName: station.name,
        stationAddress: station.address
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Réservation confirmée:', result);
        // this.loadStations(); // if you want to refresh availability
      }
    });
  }

  viewStationDetails(station: ChargingStationUI): void {
    console.log('Voir détails de:', station.name);
    // this.router.navigate(['/station-details', station.id]);
  }

  navigateToStation(station: ChargingStationUI): void {
    if (this.userLocation) {
      const mapsUrl = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${station.latitude},${station.longitude}`;
      window.open(mapsUrl, '_blank');
    } else {
      const mapsUrl = `https://www.google.com/maps?q=${station.latitude},${station.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  }

  toggleFavorite(station: ChargingStationUI): void {
    station.isFavorite = !station.isFavorite;
    this.saveFavoriteStatus(station.id!, !!station.isFavorite);
    console.log(`Station ${station.name} ${station.isFavorite ? 'ajoutée aux' : 'retirée des'} favoris`);
  }

  findMyLocation(): void {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par ce navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.calculateDistances();
        this.applyFilters();
        alert(`Position: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible de récupérer votre position.');
      }
    );
  }

  // =================== UTILITIES ===================

  findStationById(id: number): ChargingStationUI | undefined {
    return this.allStations.find(station => station.id === id);
  }

  checkIfFavorite(stationId: number): boolean {
    const favorites = JSON.parse(localStorage.getItem('favoriteStations') || '[]');
    return favorites.includes(stationId);
  }

  saveFavoriteStatus(stationId: number, isFavorite: boolean): void {
    let favorites: number[] = JSON.parse(localStorage.getItem('favoriteStations') || '[]');
    if (isFavorite && !favorites.includes(stationId)) {
      favorites.push(stationId);
    } else if (!isFavorite) {
      favorites = favorites.filter((id: number) => id !== stationId);
    }
    localStorage.setItem('favoriteStations', JSON.stringify(favorites));
  }

  getTotalStationsCount(): number { return this.allStations.length; }

  getAvailableStationsCount(): number {
    return this.allStations.filter(station => station.available && station.working).length;
  }

  getFilteredStationsCount(): number { return this.filteredStations.length; }

  trackByStationId(index: number, station: ChargingStationUI): any {
    return station.id || index;
  }

  getTypeClass(type: string | undefined): string {
    switch (type) {
      case 'STANDARD': return 'type-standard';
      case 'FAST': return 'type-fast';
      case 'ULTRA_FAST': return 'type-ultra-fast';
      default: return 'type-standard';
    }
  }

  getTypeIcon(type: string | undefined): string {
    switch (type) {
      case 'STANDARD': return 'fas fa-plug';
      case 'FAST': return 'fas fa-bolt';
      case 'ULTRA_FAST': return 'fas fa-rocket';
      default: return 'fas fa-plug';
    }
  }

  getTypeLabel(type: string | undefined): string {
    switch (type) {
      case 'STANDARD': return 'Charge normale';
      case 'FAST': return 'Charge rapide';
      case 'ULTRA_FAST': return 'Charge ultra rapide';
      default: return 'Charge normale';
    }
  }

  getAvailabilityClass(station: ChargingStationUI): string {
    if (!station.working) return 'status-maintenance';
    return station.available ? 'status-available' : 'status-busy';
    }

  getStatusText(station: ChargingStationUI): string {
    if (!station.working) return 'En maintenance';
    return station.available ? 'Disponible' : 'Occupée';
  }

  getDistanceClass(distance: number | undefined): string {
    if (!distance && distance !== 0) return '';
    if (distance < 2) return 'distance-close';
    if (distance < 10) return 'distance-medium';
    return 'distance-far';
  }
navigateToReservation(stationId: number): void {
  // This will navigate to /reservation/{id} — adjust route as needed
  this.router.navigate(['/reservation', stationId]);
}
  formatDistance(distance: number | undefined): string {
    if (distance === undefined) return 'Distance inconnue';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance}km`;
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined || price === null) return 'Prix non spécifié';
    return `${price.toFixed(2)} TND/kWh`;
  }

  isStationReservable(station: ChargingStationUI): boolean {
    return station.available && station.working;
  }


toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

 

  toggleDarkMode() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  console.log('🌙 Thème changé vers:', newTheme);
}




  toggleNotifications() {
    alert('Notifications toggled');
  }

 

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  navigateToProfile() {}
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


logout(): void {
  this.authService.logout();
  this.router.navigate(['/login']);
}



}
