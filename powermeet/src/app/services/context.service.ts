import { Injectable } from '@angular/core';
import { ContextInfo } from './context-info';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private contextInfo: ContextInfo;
  private loggedIn: boolean;

  constructor() { 
    const userString = window.sessionStorage.getItem('contextInfo');
    if (userString == null) {
      this.contextInfo = new ContextInfo();
      this.loggedIn = false;
    } else {
      this.contextInfo = JSON.parse(userString);
      this.loggedIn = this.contextInfo.isAuthenticated;
    }
  }
  public Clear() {
    window.sessionStorage.removeItem('contextInfo');
    this.contextInfo = new ContextInfo();
    this.loggedIn = false;
  }
  public get ContextInfo(): any {
    return this.contextInfo;
  }
}
