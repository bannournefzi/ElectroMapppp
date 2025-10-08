import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { ProfileService, UserProfileDTO } from 'src/app/services/profile.service';

interface ProfileAction {
  icon: string;
  label: string;
  action: () => void;
  color?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error: string | null = null;
  data: UserProfileDTO | null = null;
  isOwnProfile = false;
  profileActions: ProfileAction[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.setupProfileActions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = null;

    const id = this.route.snapshot.paramMap.get('id');
    this.isOwnProfile = !id;
    
    const profileObservable = id ? 
      this.profileService.byId(+id) : 
      this.profileService.me();

    profileObservable
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erreur lors du chargement du profil:', error);
          this.error = 'Impossible de charger le profil utilisateur';
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(data => {
        this.data = data;
      });
  }

  private setupProfileActions(): void {
    this.profileActions = [
      {
        icon: 'edit',
        label: 'Modifier le profil',
        action: () => this.editProfile(),
        disabled: !this.isOwnProfile
      },
      {
        icon: 'mail',
        label: 'Envoyer un message',
        action: () => this.sendMessage(),
        disabled: this.isOwnProfile
      },
      {
        icon: 'share',
        label: 'Partager le profil',
        action: () => this.shareProfile()
      }
    ];
  }

  editProfile(): void {
    if (this.data && this.isOwnProfile) {
      this.router.navigate(['/profile/edit']);
    }
  }

  sendMessage(): void {
    if (this.data && !this.isOwnProfile) {
      // Logique pour envoyer un message
      console.log('Envoyer un message à:', this.data.email);
    }
  }

  shareProfile(): void {
    if (navigator.share && this.data) {
      navigator.share({
        title: `Profil de ${this.data.firstName} ${this.data.lastName}`,
        text: `Découvrez le profil de ${this.data.firstName} ${this.data.lastName}`,
        url: window.location.href
      });
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href);
      // Ici vous pourriez ajouter une notification toast
      console.log('URL copiée dans le presse-papiers');
    }
  }

  refreshProfile(): void {
    this.loadProfile();
  }

  getStatusColor(): string {
    if (!this.data) return 'gray';
    if (this.data.accountLocked) return 'red';
    if (!this.data.enabled) return 'orange';
    return 'green';
  }

  getStatusText(): string {
    if (!this.data) return 'Inconnu';
    if (this.data.accountLocked) return 'Compte verrouillé';
    if (!this.data.enabled) return 'Compte désactivé';
    return 'Actif';
  }

  getRoleColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      'ADMIN': 'red',
      'USER': 'blue',
      'MODERATOR': 'purple',
      'MANAGER': 'green'
    };
    return roleColors[role.toUpperCase()] || 'gray';
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) return '—';
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '—';
    }
  }

  formatDateOfBirth(dateString: string | null | undefined): string {
    if (!dateString) return 'Non renseignée';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Non renseignée';
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Non renseignée';
    }
  }

  goBack(): void {
    this.location.back();
  }

  getTimeSinceCreation(): string {
    if (!this.data?.creationDate) return '';
    
    const created = new Date(this.data.creationDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `Membre depuis ${diffDays} jour(s)`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Membre depuis ${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Membre depuis ${years} an(s)`;
    }
  }
}