import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(private router: Router, public authService: AuthService){

  }
  canActivate(next: ActivatedRouteSnapshot,state: RouterStateSnapshot): boolean {
    const token = sessionStorage.getItem('token');
    // const val = JSON.parse(token);
    console.log('val', token);
    if(token)return true;
    else {
      // this.router.navigate(['/Login']);
      // this.authService.partialsignIn();
      return false;
    }
    // return true;
  }
  
}
