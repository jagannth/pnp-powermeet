import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
// import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { MSGraphClient } from "@microsoft/sp-http";  
// import * as microsoftTeams from "@microsoft/teams-js";
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { IItemAddResult } from "@pnp/sp/items";
import { SharePointDataServicesService } from '../services/share-point-data-services.service';



export interface IEvent {
  subject: string;
  organizer?: string;
  start?: string;
  end?: string;
}

export interface IEventColl {
  value: IEvent[];
}

@Component({
  selector: 'app-powermeet-web-part',
  templateUrl: './powermeet-web-part.component.html',
  styleUrls: ['./powermeet-web-part.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PowermeetWebPartComponent implements OnInit {
  @Input() description: any;
  @Input() user: any;
  @Input() group: any;
  @Input() context: any;
  @Input() siteUrl: any;
  // private _teamsContext: microsoftTeams.Context;
  constructor(private shrService: SharePointDataServicesService) { }

  ngAfterViewInit() {
    // sessionStorage.setItem('authconfig', this.description);
    // sessionStorage.setItem('user', this.user);
    // sessionStorage.setItem('groupId', this.group);
    // sessionStorage.setItem('siteUrl', this.siteUrl);
    
    sessionStorage.setItem('authconfig', "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkZ5bEpXXzZjMnRYTU45UkktR2lhbWdkNVZMSWc0TDFTdzhiMWZtNzZGWm8iLCJhbGciOiJSUzI1NiIsIng1dCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSIsImtpZCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC84NGE5ODQzYi0wYjI5LTQ3MjktYmE4YS04MTU1Y2Y1NWM3YWUvIiwiaWF0IjoxNTkzNTI3NjkxLCJuYmYiOjE1OTM1Mjc2OTEsImV4cCI6MTU5MzUzMTU5MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkUyQmdZR2pkdzl6TUhMOXhlcG5Ea1J6eCtTbk5WVi8rV09pd20rbjRMY240WW1oV0dRc0EiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6IlNoYXJlUG9pbnQgT25saW5lIENsaWVudCBFeHRlbnNpYmlsaXR5IFdlYiBBcHBsaWNhdGlvbiBQcmluY2lwYWwiLCJhcHBpZCI6IjY4ZTY5NGUzLTU0YTctNDM2NC1hZDRlLTViN2RlZWY4Yzk4YiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiS3VtYXIiLCJnaXZlbl9uYW1lIjoiVmluYXkiLCJpcGFkZHIiOiIxNTcuNDEuMTU5LjMyIiwibmFtZSI6IlZpbmF5IEt1bWFyIiwib2lkIjoiMDNlNmFjOGMtNjUzZS00YmU4LTljMGMtZDg3ODNiMWNhZmMwIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDAwOUFGNTEwREYiLCJzY3AiOiJDYWxlbmRhcnMuUmVhZCBDYWxlbmRhcnMuUmVhZFdyaXRlIEdyb3VwLlJlYWQuQWxsIFByZXNlbmNlLlJlYWQuQWxsIFNpdGVzLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkLkFsbCBVc2VyLlJlYWRCYXNpYy5BbGwiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiIzckJ2SXdHemRiS1VwdExEbzlqSFNFMTZEeDVVQk9wTDFZN2stXzlrZldrIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFTIiwidGlkIjoiODRhOTg0M2ItMGIyOS00NzI5LWJhOGEtODE1NWNmNTVjN2FlIiwidW5pcXVlX25hbWUiOiJ2aW5heS5rdW1hckBzdGljc29mdC5pbyIsInVwbiI6InZpbmF5Lmt1bWFyQHN0aWNzb2Z0LmlvIiwidXRpIjoibHJOblNfSE13RW1FeG01eE1uQmNBQSIsInZlciI6IjEuMCIsInhtc190Y2R0IjoxNTgxNTA3NDgzfQ.W0grDk7HKVdssglIu550rTIgElDmLT_HlQnq1fL9vKZZ9Q1O_fta_VmMMkTdhHwBOGBRCi1NAE8TZ3AEBBbAEyQG1DnSDZFntarmUGCh80cXaEWKpp5ihmSZA4rDA0rgBSdzgNajXYn601xqeoZAHGGNylotQGGl9rBE7Zp6csfVTSZ3XbRmuyUT9NPC8P8ITBG9jKm2F-cZC3LAosEln1R43jrvg13BpyHpQVM1s5IH_eZZsEOHjk1VQq1KbwuYHoKEq_EgA_TS5dCVZf4DzpHx9ebf46FeZ4P4BV8tNdsduvqp4bRPnHuw9VmosbdgrN1tcIfDmQ7a8n8wSdhYyw");
    sessionStorage.setItem('user', "santhosh.addagulla@sticsoft.io");
    sessionStorage.setItem('groupId', "54b63089-c127-4cd9-9dd5-72013c0c3eaa");
    

    (<HTMLAnchorElement>document.getElementById('dashboard')).click();
    console.log('adal token view', sessionStorage.getItem('adal.access.token.keyhttps://graph.microsoft.com'));
    console.log('context', this.context);
  }
  async ngOnInit() {
 
    //  this.shrService.get('Meetings').then(res=>{
    //    console.log('sharepoint get response', res);
    //  });
  }
}
