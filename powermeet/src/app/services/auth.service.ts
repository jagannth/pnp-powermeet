import { Injectable } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { OAuthSettings } from './oauth';
import { User } from '../models/User';
// import { Client } from '@microsoft/microsoft-graph-client';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authenticated: boolean;
  public user: User;

  constructor(private msalService: MsalService, private router: Router, private broadcastService: BroadcastService) {
  }
  // Prompt the user to sign in and
 
}
