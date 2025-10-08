import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { ValidateAccountComponent } from './auth/validate-account/validate-account.component';
import { LoginComponent } from './auth/login/login.component';
import { LandingComponent } from './pages/landing/landing.component';
import { AdminComponent } from './pages/admin/admin.component';
import { UserComponent } from './pages/user/user.component';  
import { UserListComponent } from './pages/user-list/user-list.component';
import { ChargingStationListComponent } from './pages/charging-station-list/charging-station-list.component';
import { MapComponent } from './pages/map/map.component';
import { UserMapComponent } from './pages/user-map/user-map.component';
import { ReservationDialogComponent } from './components/reservation-dialog/reservation-dialog.component';
import { MesReservationsComponent } from './pages/mes-reservations/mes-reservations.component';
import { AllStationsComponent } from './pages/all-stations/all-stations.component';
import {AdminReservationsComponent} from './pages/admin-reservations/admin-reservations.component'
import {ProfileComponent}from './pages/profile/profile.component'


const routes: Routes = [
   { path: 'register', component: RegisterComponent },//tout le mode 
   { path: 'login', component: LoginComponent },//tout le mode 
   { path: '', component: LandingComponent },  // accueil
   { path: 'validate-account', component: ValidateAccountComponent },//tout le mode 
   { path: 'admin', component: AdminComponent },//admin_interface-ou-se-trouve-les-admin-dashborad
   { path: 'user', component: UserComponent },//user_interface-ou-se-trouve-les-user-dashborad
   { path: 'user_list', component: UserListComponent },
   { path: 'stations', component: ChargingStationListComponent },
   { path: 'map', component: MapComponent },
   { path: 'mapuser', component: UserMapComponent },
   { path: 'itineraire', component: MapComponent },
   { path: 'mes-reservations', component: MesReservationsComponent },
   { path: 'reservation/:stationId',component: ReservationDialogComponent},
   { path: 'AllStations' ,component: AllStationsComponent  },
   { path: 'payment/success', loadComponent: () => import('./pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent) },
   { path: 'payment/cancel',  loadComponent: () => import('./pages/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent) },
   { path: 'admin/reservations', component: AdminReservationsComponent },
   { path: 'profile', component: ProfileComponent },          // mon profil
   { path: 'admin/users/:id', component: ProfileComponent },  //



   








];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
