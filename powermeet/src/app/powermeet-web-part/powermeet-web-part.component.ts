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
    
    sessionStorage.setItem('authconfig', "eyJ0eXAiOiJKV1QiLCJub25jZSI6Imk1dHQ0VktBM2QzNlF1dnVxMnFMamF0aEVlTG1YRzBfVzJOOW0teUFqbXMiLCJhbGciOiJSUzI1NiIsIng1dCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSIsImtpZCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC84NGE5ODQzYi0wYjI5LTQ3MjktYmE4YS04MTU1Y2Y1NWM3YWUvIiwiaWF0IjoxNTk0MjExMDI3LCJuYmYiOjE1OTQyMTEwMjcsImV4cCI6MTU5NDIxNDkyNywiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkUyQmdZR0F1L05mTFh1RE1kNDNsbTQyYlk2RDMyeGpGSDJsWHN4clhDcnB4ZGUvN2tBQUEiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6IlNoYXJlUG9pbnQgT25saW5lIENsaWVudCBFeHRlbnNpYmlsaXR5IFdlYiBBcHBsaWNhdGlvbiBQcmluY2lwYWwiLCJhcHBpZCI6IjY4ZTY5NGUzLTU0YTctNDM2NC1hZDRlLTViN2RlZWY4Yzk4YiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiS3VtYXIiLCJnaXZlbl9uYW1lIjoiVmluYXkiLCJpcGFkZHIiOiIxNTcuNDEuMTA1LjIzOCIsIm5hbWUiOiJWaW5heSBLdW1hciIsIm9pZCI6IjAzZTZhYzhjLTY1M2UtNGJlOC05YzBjLWQ4NzgzYjFjYWZjMCIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwMDlBRjUxMERGIiwic2NwIjoiQ2FsZW5kYXJzLlJlYWQgQ2FsZW5kYXJzLlJlYWRXcml0ZSBHcm91cC5SZWFkLkFsbCBQcmVzZW5jZS5SZWFkLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZC5BbGwgVXNlci5SZWFkQmFzaWMuQWxsIiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiM3JCdkl3R3pkYktVcHRMRG85akhTRTE2RHg1VUJPcEwxWTdrLV85a2ZXayIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJBUyIsInRpZCI6Ijg0YTk4NDNiLTBiMjktNDcyOS1iYThhLTgxNTVjZjU1YzdhZSIsInVuaXF1ZV9uYW1lIjoidmluYXkua3VtYXJAc3RpY3NvZnQuaW8iLCJ1cG4iOiJ2aW5heS5rdW1hckBzdGljc29mdC5pbyIsInV0aSI6IlBZMVRzNWRaSzBxejB6Mi1fQWp4QUEiLCJ2ZXIiOiIxLjAiLCJ4bXNfdGNkdCI6MTU4MTUwNzQ4M30.p4BQaBLtW9Q1eGnDtqkiIo5kgAyGIWP9bKNNCCVkq-VGzWN9YbsCbjEVL29keemf_itmr0tKVneLDoed2FC5jKfUMf_z0JhICJSiQbQ6n11tSwi_dY_xZYpxtRNKwywCHoaUbBSKJnyGE7vokGgSXomGIlw8mRB93HeGZN5WCSmwgoGODymx2m1w7JRPay5ynUinU4jhCLaJlD1VNnpB-qSzCWZ_GWs-Cs8_Qg2YwYcNfs1ZMZgRcIvHaFIRBNgsOCPhRJWbgnNK3rSJpPxnH1Z9_mAWbV6MAh4MCGdCfCUBUOUy8KrAappsIgoHK9pdxUYMaylqN3KS3xL23no0Lg");
    sessionStorage.setItem('user', "vinay.kumar@sticsoft.io");
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
