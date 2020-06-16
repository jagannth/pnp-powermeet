import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetAttendiesService {
  totalAngularPackages: any;
 
  constructor(private http: HttpClient) { }

  // getattendies() {
  //   this.http.get<any>('https://api.npms.io/v2/search?q=scope:angular').subscribe(data => {
  //     this.totalAngularPackages = data.results;
  //       console.log(this.totalAngularPackages);
  //      return this.totalAngularPackages;
  //   })

    getattendies(): Observable<any>{
      return this.http.get("https://api.npms.io/v2/search?q=scope:angular");
    }

}
