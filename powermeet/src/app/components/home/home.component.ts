import { GraphService } from './../../services/graph.service';
import { Component, OnInit } from '@angular/core';
import { ProxyService } from 'src/app/services/proxy.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import { MsalService } from '@azure/msal-angular';
import { Client } from '@microsoft/microsoft-graph-client';
import { OAuthSettings } from '../../services/oauth';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  meetingsList: any = [];
  auth: boolean = false;


  constructor(public spinner: NgxSpinnerService, private router: Router) { }

  ngOnInit(): void {
    const val = sessionStorage.getItem('user');
    if (!val) {
      this.router.navigate(['/Login']);
    }
  }
}
