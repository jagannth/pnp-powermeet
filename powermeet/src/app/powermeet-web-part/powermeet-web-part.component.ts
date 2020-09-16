import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
// import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { MSGraphClient } from "@microsoft/sp-http";
import * as microsoftTeams from "@microsoft/teams-js";
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { IItemAddResult } from "@pnp/sp/items";
import { SharePointDataServicesService } from "../services/share-point-data-services.service";
import { DataService } from "../services/data.service";
import { GraphService } from "../services/graph.service";
import { User } from "../models/User";

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
  selector: "app-powermeet-web-part",
  templateUrl: "./powermeet-web-part.component.html",
  styleUrls: ["./powermeet-web-part.component.css"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class PowermeetWebPartComponent implements OnInit {
  @Input() description: any;
  @Input() user: any;
  @Input() group: any;
  @Input() siteUrl: any;
  // private _teamsContext: microsoftTeams.Context;
  constructor(
    private graphService: GraphService,
    private dataService: DataService
  ) {
    sessionStorage.setItem("subEntityId", "");
    microsoftTeams.initialize();
    microsoftTeams.getContext(function (context) {
      console.log("team context", context);
      console.log("subEntityId", context.subEntityId);
      sessionStorage.setItem("subEntityId", context.subEntityId);
    });
  }

  ngOnInit() {
    this.getGraphUsers();
  }
  getGraphUsers() {
    this.graphService.getUsers().then((res) => {
      console.log("users list response ", res);
      const users = new Array<User>();
    if(res){
      res.forEach((x) => {
        const user = new User();
        user.id = x.id;
        user.fullname = x.displayName;
        user.email = x.userPrincipalName;
        user.displayName = x.givenName.slice(0, 1) + x.surname.slice(0, 1);
        user.card = `<div class="card" style="width: 18rem;border: none;text-align: left;"><h6>${user.fullname}</h6><p>${user.email}</p></div>`;
        this.graphService
          .getUserProfile(x.userPrincipalName)
          .then((res) => {
            if (res) {
              let reader = new FileReader();
              reader.addEventListener(
                "load",
                () => {
                  user.file = reader.result;
                  user.status = true;
                },
                false
              );
              if (res) {
                reader.readAsDataURL(res);
              }
            }
          })
          .catch((error) => {
            console.log("error", error);
            user.status = false;
          });
        users.push(user);
      });
      this.dataService.updatedDataSelection(users);
    }
    });
  }
  ngAfterViewInit() {
    sessionStorage.setItem('authconfig', this.description);
    sessionStorage.setItem('user', this.user);
    sessionStorage.setItem('groupId', this.group);

    // sessionStorage.setItem(
    //   "authconfig",
    //   "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkZEdy1PN0xQT3gzWHBmSlowSGpPNXg1X0t5aC1Zb2ZWemkySWtQN21QNzgiLCJhbGciOiJSUzI1NiIsIng1dCI6ImppYk5ia0ZTU2JteFBZck45Q0ZxUms0SzRndyIsImtpZCI6ImppYk5ia0ZTU2JteFBZck45Q0ZxUms0SzRndyJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC84NGE5ODQzYi0wYjI5LTQ3MjktYmE4YS04MTU1Y2Y1NWM3YWUvIiwiaWF0IjoxNjAwMjQxNzAyLCJuYmYiOjE2MDAyNDE3MDIsImV4cCI6MTYwMDI0NTYwMiwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkUyQmdZTWcyY2duVDVFMEkzTm9UZCt6cHQ3OWJOT3hQdlhQYWZTZDVmV25NZlYvSFg4VUEiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6IlNoYXJlUG9pbnQgT25saW5lIENsaWVudCBFeHRlbnNpYmlsaXR5IFdlYiBBcHBsaWNhdGlvbiBQcmluY2lwYWwiLCJhcHBpZCI6IjY4ZTY5NGUzLTU0YTctNDM2NC1hZDRlLTViN2RlZWY4Yzk4YiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiS3VtYXIiLCJnaXZlbl9uYW1lIjoiVmluYXkiLCJoYXN3aWRzIjoidHJ1ZSIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjE1Ny40MS4xMDAuMTgiLCJuYW1lIjoiVmluYXkgS3VtYXIiLCJvaWQiOiIwM2U2YWM4Yy02NTNlLTRiZTgtOWMwYy1kODc4M2IxY2FmYzAiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDA5QUY1MTBERiIsInJoIjoiMC5BQUFBTzRTcGhDa0xLVWU2aW9GVnoxWEhydU9VNW1pblZHUkRyVTViZmU3NHlZdEtBT1UuIiwic2NwIjoiQ2FsZW5kYXJzLlJlYWQgQ2FsZW5kYXJzLlJlYWRXcml0ZSBDaGFubmVsTWVzc2FnZS5TZW5kIEdyb3VwLlJlYWQuQWxsIEdyb3VwLlJlYWRXcml0ZS5BbGwgUHJlc2VuY2UuUmVhZC5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQuQWxsIFVzZXIuUmVhZEJhc2ljLkFsbCIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjNyQnZJd0d6ZGJLVXB0TERvOWpIU0UxNkR4NVVCT3BMMVk3ay1fOWtmV2siLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiI4NGE5ODQzYi0wYjI5LTQ3MjktYmE4YS04MTU1Y2Y1NWM3YWUiLCJ1bmlxdWVfbmFtZSI6InZpbmF5Lmt1bWFyQHN0aWNzb2Z0LmlvIiwidXBuIjoidmluYXkua3VtYXJAc3RpY3NvZnQuaW8iLCJ1dGkiOiJERm9yV1dYMWFFS3pnT1Q5b3h0T0FBIiwidmVyIjoiMS4wIiwieG1zX3RjZHQiOjE1ODE1MDc0ODN9.etzZvyJx2JIRG-_hxKfFM2Ob7ufRN6tM_rsV2fb8jZC39RZnw0SM6e3uZR3Z_D9khPTL0thU5wg9iwcprZ8qlYNTjXCR7iqkMWbUm94N_5tjw5uKPrgnvbDE1vx551FCivtcu9YKGFIhadfoy8lzj-lKptM-H3hQLuWufprIKs4mCnLiXiXUDBqpUtb9eCMBuPD16N7xepztl9tcF0hcO35w56JZuwrDZSr6YUBRGl-JzZTAXYRKE0CaLlG3N6q9c1WqvBcvmVpcsPQyKFS4Gh-xcMQVwbga2-yaLeexNG1oTHXXIoNgZ93BjFSkWJMsxA26tIcGTxvIJUmFru6H2w"
    // );
    // sessionStorage.setItem("user", "vinay.kumar@sticsoft.io");
    // // sessionStorage.setItem("user", "santhosh.addagulla@sticsoft.io");
    // sessionStorage.setItem("groupId", "54b63089-c127-4cd9-9dd5-72013c0c3eaa");

    // sessionStorage.setItem('channelId', "19:66897d02aa6745428f4c8117cc197f39@thread.tacv2a");

    (<HTMLAnchorElement>document.getElementById("dashboard")).click();
  }
}
