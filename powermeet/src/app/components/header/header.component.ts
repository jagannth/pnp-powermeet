import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isIEOrEdge: boolean;
  chrome: boolean;
  firefox: boolean;
  opera: boolean;
  hidingsignoutbutton: boolean;
  isWeb: boolean = true;
  @Input('value') notifLnt: number;

  constructor() { }

  ngOnInit(): void {
    // let token = JSON.parse(sessionStorage.getItem('authconfig'));
    // if(!token) this.isWeb = true;
    // else this.isWeb = false;
    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)
     this.chrome = /msie\s|trident\/|chrome\//i.test(window.navigator.userAgent)
     this.firefox =  /msie\s|trident\/|firefox\//i.test(window.navigator.userAgent)
     this.opera =  /msie\s|trident\/|opera\//i.test(window.navigator.userAgent)
     if(this.isIEOrEdge  || this.chrome || this.firefox || this.opera){
     this.hidingsignoutbutton = true;
     }
  }

  signOut(): void {
  }
}
