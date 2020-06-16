import { Injectable } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { OAuthSettings } from './oauth';
import { User } from '../models/User';
import { Client } from '@microsoft/microsoft-graph-client';
import { Router } from '@angular/router';
import * as microsoftTeams from "@microsoft/teams-js";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authenticated: boolean;
  public user: User;

  constructor(private msalService: MsalService, private router: Router, private broadcastService: BroadcastService) {
    microsoftTeams.initialize();

    // Initialize the Graph client
    this.graphClient = Client.init({
      authProvider: async (done) => {
        // Get the token from the auth service
        let token = await this.getAccessToken()
          .catch((reason) => {
            done(reason, null);
          });

        if (token) {
          done(null, token);
        } else {
          done("Could not get an access token", null);
        }
      }
    });

    // this.authenticated = this.msalService.;
    this.getUser().then((user) => { this.user = user });
  }
  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  authToken: any;
  async signIn(): Promise<void> {
    await this.msalService.loginPopup(OAuthSettings.scopes).then((res) => {
      this.broadcastService.subscribe("msal:loginFailure", (payload) => {
        console.log('failure');
      });

      this.broadcastService.subscribe("msal:loginSuccess", async (payload) => {
        console.log('success', payload._token);
        this.authToken = payload._token;
        this.authenticated = true;
        this.user = await this.getUser();
        sessionStorage.setItem('user', this.user.email);
        await document.getElementById('homelogin').click();
        //  this.router.navigate(['/Home']);
      });
    })
      .catch((reason) => {
        console.log('Login failed', JSON.stringify(reason, null, 2));
      });
    // if (result) {
    //   this.authenticated = true;
    //   this.user = await this.getUser();
    //   // this.router.navigate(['/Home']);
    // }
    // sessionStorage.setItem('token', result);
    // sessionStorage.setItem('user', this.user.email);
    // console.log('user result', this.user);

    // const val = this.msalService.loginRedirect(OAuthSettings.scopes);
    // console.log('getCachedTokenInternal', val);
  }
  async partialsignIn(): Promise<void> {
    await this.msalService.loginRedirect(OAuthSettings.scopes);
    console.log('partial');
    // sessionStorage.setItem('token',JSON.stringify(this.msalService.getCachedTokenInternal(OAuthSettings.scopes)));
    // this.user = await this.getUser();
    // console.log('userrrrrrr', this.user);
    // sessionStorage.setItem('user', this.user.userPrincipalName);
    // if(sessionStorage.getItem('token'))
    // this.router.navigate(['/Home']);
    // this.msalService.handleRedirectCallback((authError, response) => {
    //   if (authError) {
    //     console.error('Redirect Error: ', authError.errorMessage);
    //     return;
    //   }

    //   console.log('Redirect Success: ', response);
    // });


  }

  // Sign out
  signOut(): void {
    this.user = null;
    this.authenticated = false;
    sessionStorage.clear();
    sessionStorage.clear();
    this.msalService.logout();
  }
  // Silently request an access token
  async getAccessToken(): Promise<string> {
    let result = await this.msalService.acquireTokenSilent(OAuthSettings.scopes)
      .catch((reason) => {
        console.log('Get token failed', JSON.stringify(reason, null, 2));
      });

    return result;
  }

  private async getUser(): Promise<User> {
    if (!this.authenticated) return null;
    let graphClient = Client.init({
      // Initialize the Graph client with an auth
      // provider that requests the token from the
      // auth service
      authProvider: async (done) => {
        let token = await this.getAccessToken()
          .catch((reason) => {
            done(reason, null);
          });

        if (token) {
          done(null, token);
        } else {
          done("Could not get an access token", null);
        }
      }
    });

    // Get the user from Graph (GET /me)
    let graphUser = await graphClient.api('/me').get();

    let user = new User();
    user.displayName = graphUser.displayName;
    // Prefer the mail property, but fall back to userPrincipalName
    user.email = graphUser.mail || graphUser.userPrincipalName;

    return user;
  }
  private graphClient: Client;
  async getEvents() {
    try {
      let result = await this.graphClient
        .api('/me/events')
        .select('subject,organizer,start,end')
        .orderby('createdDateTime DESC')
        .get();

      return result.value;
    } catch (error) {
      console.log('Could not get events', JSON.stringify(error, null, 2));
    }
  }
}
