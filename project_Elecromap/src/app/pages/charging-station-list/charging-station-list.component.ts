import { Component, OnInit } from '@angular/core';
import { ChargingStationService } from '../../services/charging-station.service';
import { ChargingStation } from '../../models/charging-station.model';

@Component({
  selector: 'app-charging-station-list',
  templateUrl: './charging-station-list.component.html',
  styleUrls: ['./charging-station-list.component.scss']
})
export class ChargingStationListComponent implements OnInit {

   stations: ChargingStation[] = [];
  allStations: ChargingStation[] = [];
  isLoading: boolean = false;

   filterAvailability: string = 'all';
  filterType: string = 'all';

   isAddModalOpen = false;
  isEditModalOpen = false;
  selectedStation: ChargingStation | null = null;

   selectedMapPosition: { lat: number; lng: number } | null = null;

   carTypes: string[] = [
    'TESLA', 'BMW', 'VOLKSWAGEN', 'AUDI',
    'RENAULT', 'PEUGEOT', 'HONDA', 'MERCEDES', 
    'NISSAN', 'HYUNDAI', 'KIA', 'CITROËN', 'OTHER'
  ];

   newStation: ChargingStation = this.getEmptyStation();

  constructor(private stationService: ChargingStationService) {}

  ngOnInit(): void {
    this.loadStations();
  }

  // =================== GESTION DES DONNÉES ===================

  
  loadStations(): void {
    this.isLoading = true;
    this.stationService.getAll().subscribe({
      next: (data) => {
        this.allStations = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stations:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Recharge les stations (bouton refresh)
   */
  reloadStations(): void {
    this.loadStations();
  }

  // =================== FILTRES ET RECHERCHE ===================

  
  applyFilters(): void {
    this.stations = this.allStations.filter((station: ChargingStation) => {
      const matchAvailability =
        this.filterAvailability === 'all' ||
        (this.filterAvailability === 'available' && station.available) ||
        (this.filterAvailability === 'unavailable' && !station.available);

      const matchType =
        this.filterType === 'all' || station.type === this.filterType;

      return matchAvailability && matchType;
    });
  }

  // =================== GESTION DES MODALES ===================

  /**
   * Ouvre la modale d'ajout
   */
  openAddModal(): void {
    this.newStation = this.getEmptyStation();
    this.isAddModalOpen = true;
  }

  /**
   * Ferme la modale d'ajout
   */
  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.newStation = this.getEmptyStation();
  }

  /**
   * Ouvre la modale de modification
   */
  openEditModal(station: ChargingStation): void {
    this.selectedStation = { ...station }; // Clone pour éviter la mutation
    this.isEditModalOpen = true;
  }

  /**
   * Ferme toutes les modales
   */
  closeModals(): void {
    this.isAddModalOpen = false;
    this.isEditModalOpen = false;
    this.selectedStation = null;
  }

  // =================== ACTIONS CRUD ===================

  /**
   * Soumet le formulaire d'ajout de station
   */
  submitAddStation(): void {
    if (!this.isValidStation(this.newStation)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.stationService.create(this.newStation).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadStations();
        this.showSuccessMessage('Station créée avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la création de la station:', err);
        this.showErrorMessage('Erreur lors de la création de la station');
      }
    });
  }

  /**
   * Soumet le formulaire de modification de station
   */
  submitEditStation(): void {
    if (!this.selectedStation || !this.selectedStation.id) {
      return;
    }

    if (!this.isValidStation(this.selectedStation)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.stationService.update(this.selectedStation.id, this.selectedStation).subscribe({
      next: () => {
        this.loadStations();
        this.closeModals();
        this.showSuccessMessage('Station modifiée avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la modification de la station:', err);
        this.showErrorMessage('Erreur lors de la modification de la station');
      }
    });
  }

  /**
   * Ouvre la confirmation de suppression
   */
  openDeleteConfirmation(station: ChargingStation): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la station "${station.name}" ?`)) {
      this.deleteStation(station);
    }
  }

  /**
   * Supprime une station
   */
  deleteStation(station: ChargingStation): void {
    if (!station.id) return;

    this.stationService.delete(station.id).subscribe({
      next: () => {
        this.loadStations();
        this.showSuccessMessage('Station supprimée avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la station:', err);
        this.showErrorMessage('Erreur lors de la suppression de la station');
      }
    });
  }

  // =================== MÉTHODES UTILITAIRES ===================

  /**
   * Retourne le nombre de stations disponibles
   */
  getAvailableStationsCount(): number {
    return this.allStations.filter(station => station.available).length;
  }

  /**
   * Fonction de tracking pour ngFor
   */
  trackByStationId(index: number, station: ChargingStation): any {
    return station.id || index;
  }

  /**
   * Retourne la classe CSS pour le type de station
   */
  getTypeClass(type: string | undefined): string {
    switch (type) {
      case 'STANDARD':
        return 'standard';
      case 'FAST':
        return 'fast';
      case 'ULTRA_FAST':
        return 'ultra-fast';
      default:
        return 'standard';
    }
  }

  /**
   * Retourne l'icône pour le type de station
   */
  getTypeIcon(type: string | undefined): string {
    switch (type) {
      case 'STANDARD':
        return 'fas fa-plug';
      case 'FAST':
        return 'fas fa-bolt';
      case 'ULTRA_FAST':
        return 'fas fa-rocket';
      default:
        return 'fas fa-plug';
    }
  }

  /**
   * Retourne le label pour le type de station
   */
  getTypeLabel(type: string | undefined): string {
    switch (type) {
      case 'STANDARD':
        return 'Charge normale';
      case 'FAST':
        return 'Charge rapide';
      case 'ULTRA_FAST':
        return 'Charge ultra rapide';
      default:
        return 'Charge normale';
    }
  }

  getAvailabilityClass(available: boolean): string {
    return available ? 'available' : 'unavailable';
  }

  /**
   * Retourne la classe CSS pour l'état de fonctionnement
   */
  getWorkingClass(working: boolean): string {
    return working ? 'working' : 'not-working';
  }

  

 
  goToMapPosition(latitude: number, longitude: number): void {
    this.selectedMapPosition = { lat: latitude, lng: longitude };
   
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank');
  }

  // updateNewStationPosition(position: { lat: number; lng: number }): void {
  //   this.newStation.latitude = position.lat;
  //   this.newStation.longitude = position.lng;
  // }
updateNewStationPosition(position: { lat: number; lng: number }): void {
  // Met à jour l'objet du formulaire
  this.newStation.latitude = position.lat;
  this.newStation.longitude = position.lng;

  console.log('Lat/Lng reçus:', position);

  // Ouvre la modale seulement après avoir mis à jour l'objet
  this.isAddModalOpen = true;
}
  toggleCarType(carType: string, event: any): void {
    if (!this.newStation.compatibleVehicles) {
      this.newStation.compatibleVehicles = [];
    }

    if (event.target.checked) {
      if (!this.newStation.compatibleVehicles.includes(carType)) {
        this.newStation.compatibleVehicles.push(carType);
      }
    } else {
      const index = this.newStation.compatibleVehicles.indexOf(carType);
      if (index > -1) {
        this.newStation.compatibleVehicles.splice(index, 1);
      }
    }
  }

 
  toggleEditCarType(carType: string, event: any): void {
    if (!this.selectedStation) return;
    
    if (!this.selectedStation.compatibleVehicles) {
      this.selectedStation.compatibleVehicles = [];
    }

    if (event.target.checked) {
      if (!this.selectedStation.compatibleVehicles.includes(carType)) {
        this.selectedStation.compatibleVehicles.push(carType);
      }
    } else {
      const index = this.selectedStation.compatibleVehicles.indexOf(carType);
      if (index > -1) {
        this.selectedStation.compatibleVehicles.splice(index, 1);
      }
    }
  }

  /**
   * Retourne une station vide pour l'initialisation
   */
  getEmptyStation(): ChargingStation {
    return {
      id: undefined,
      name: '',
      type: 'STANDARD',
      latitude: 0,
      longitude: 0,
      address: '',
      power: 0,
      pricePerKwh: 0,
      connectorTypes: '',
      description: '',
      available: true,
      working: true,
      compatibleVehicles: []
    };
  }

  /**
   * Valide les données d'une station
   */
  isValidStation(station: ChargingStation): boolean {
    return !!(
      station.name &&
      station.name.trim() &&
      station.type &&
      station.latitude !== 0 &&
      station.longitude !== 0 &&
      station.power &&
      station.power > 0 &&
      station.pricePerKwh !== undefined &&
      station.pricePerKwh >= 0
    );
  }

  /**
   * Affiche un message de succès
   */
  showSuccessMessage(message: string): void {
    // Vous pouvez implémenter ici votre système de notification
    // Par exemple avec Angular Material Snackbar ou Toastr
    alert(message); // Temporaire, remplacez par votre système de notification
  }

  /**
   * Affiche un message d'erreur
   */
  showErrorMessage(message: string): void {
    // Vous pouvez implémenter ici votre système de notification
    // Par exemple avec Angular Material Snackbar ou Toastr
    alert(message); // Temporaire, remplacez par votre système de notification
  }
}