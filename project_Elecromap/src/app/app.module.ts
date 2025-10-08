import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
import { PlanTripModalComponent } from './components/plan-trip-modal/plan-trip-modal.component';
import { ReservationDialogComponent } from './components/reservation-dialog/reservation-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MesReservationsComponent } from './pages/mes-reservations/mes-reservations.component';
import { PipesModule } from './pipes/pipes.module';
import { AllStationsComponent } from './pages/all-stations/all-stations.component';
import { AdminReservationsComponent } from './pages/admin-reservations/admin-reservations.component';
import { ProfileComponent } from './pages/profile/profile.component';



@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    ValidateAccountComponent,
    LoginComponent,
    LandingComponent,
    AdminComponent,
    UserComponent,
    UserListComponent,
    ChargingStationListComponent,
    MapComponent,
    UserMapComponent,
    PlanTripModalComponent,
    ReservationDialogComponent,
    MesReservationsComponent,
    AllStationsComponent,
    AdminReservationsComponent,
    ProfileComponent,
   ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,                
    MatInputModule,                    
    MatSelectModule,                   
    MatButtonModule,
    PipesModule 

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
