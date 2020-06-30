import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { PowermeetWebPartComponent } from './powermeet-web-part/powermeet-web-part.component';
import { HomeComponent } from './components/home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './components/header/header.component';

import { APP_BASE_HREF } from '@angular/common';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { TodayMeetingsComponent } from './components/today-meetings/today-meetings.component';
import { MeetingDetailsComponent } from './components/meeting-details/meeting-details.component';
import { PastMeetingsComponent } from './components/past-meetings/past-meetings.component';
import { AgendaNotesComponent } from './components/agenda-notes/agenda-notes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SearchPipe } from './common/search.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { OAuthSettings } from './services/oauth';
import { ChartsModule } from 'ng2-charts';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MsalModule } from '@azure/msal-angular';
import { DataService } from './services/data.service';

@NgModule({
  declarations: [
    PowermeetWebPartComponent,
    HomeComponent,
    HeaderComponent,
    NotificationsComponent,
    TodayMeetingsComponent,
    MeetingDetailsComponent, PastMeetingsComponent, AgendaNotesComponent, DashboardComponent, SearchPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ChartsModule,
    RouterModule,
    NgxSpinnerModule,
    MsalModule.forRoot({
    clientID: OAuthSettings.appId,    
    validateAuthority : true,
    cacheLocation : "sessionStorage",
    storeAuthStateInCookie: false, // dynamically set to true when IE11   
    popUp: true,
    protectedResourceMap: [
      ['https://graph.microsoft.com/v1.0/me', ['user.read']]
    ],
  })

],
  providers: [DataService,{ provide: APP_BASE_HREF, useValue: '/' }],
  entryComponents: [PowermeetWebPartComponent],
  // bootstrap: [PowermeetWebPartComponent]
})
export class AppModule {
  constructor(private injector: Injector) { }

  ngDoBootstrap() {
    const el = createCustomElement(PowermeetWebPartComponent, { injector: this.injector });
    customElements.define('app-powermeet-web-part', el);
  }
}
