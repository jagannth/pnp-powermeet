import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MeetingDetailsComponent } from './components/meeting-details/meeting-details.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { AgendaNotesComponent } from './components/agenda-notes/agenda-notes.component';
import { PastMeetingsComponent } from './components/past-meetings/past-meetings.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  { path: 'Agendas', component: MeetingDetailsComponent },
  { path: 'Home', component: HomeComponent},
  // { path: 'Notifications', component: NotificationsComponent ,canActivate: [MsalGuard]},
  { path: 'Notifications', component: NotificationsComponent },
  { path: 'MeetingDetails', component: MeetingDetailsComponent },
  { path: 'Notes', component: AgendaNotesComponent},
  { path: 'PastMeetings', component: PastMeetingsComponent},
  { path: 'Dashboard', component: DashboardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
