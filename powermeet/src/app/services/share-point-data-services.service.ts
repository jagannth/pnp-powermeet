import { Injectable } from '@angular/core';
import { MSGraphClient } from "@microsoft/sp-http";  
import { WebPartContext } from "@microsoft/sp-webpart-base";
import * as microsoftTeams from "@microsoft/teams-js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { IItemAddResult } from "@pnp/sp/items";

@Injectable({
  providedIn: 'root'
})
export class SharePointDataServicesService {
  public WpContext : WebPartContext;
  constructor(context:WebPartContext) {
      this.WpContext = context;
   }
   
}
