import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MSGraphClient } from "@microsoft/sp-http";  
import { WebPartContext } from "@microsoft/sp-webpart-base";
import * as microsoftTeams from "@microsoft/teams-js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { IItemAddResult } from "@pnp/sp/items";

export interface IEvent {  
  subject: string;  
  organizer?: string;  
  start?: string;  
  end?: string; 
}  

export interface IEventColl{  
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
  @Input() context: any;
  private _teamsContext: microsoftTeams.Context;
  constructor() { }

  ngAfterViewInit() {
    sessionStorage.setItem('authconfig', this.description);
    sessionStorage.setItem('user', this.user);
    (<HTMLAnchorElement>document.getElementById('dashboard')).click();
    console.log('adal token view',sessionStorage.getItem('adal.access.token.keyhttps://graph.microsoft.com'));
  }
   async ngOnInit() {
    if (this.context.microsoftTeams) {
       debugger;
       alert("In Teams 01");
       await this.context.microsoftTeams.getContext(teamscontext => {
          this._teamsContext = teamscontext;
          this.getEvents("/groups/"+teamscontext.groupId+"/calendar/events").then((Res) => {
            console.log(Res);
          }).catch((err) =>{
            console.log(err);
          })      
        });
    }else{
        alert("In SharePoint");
        this.getEvents("/me/events").then((Res) => {
          console.log(Res);
        }).catch((err) =>{
          console.log(err);
        })
    }   
    console.log('desc',this.context);   
  }

    public getEvents(endUrl:string): Promise<IEvent[]> { 
      return new Promise<IEvent[]>((resolve, reject) => {  
          try {              
              var events: Array<IEvent> = new Array<IEvent>();
              this.context.msGraphClientFactory  
                  .getClient()  
                  .then((client: MSGraphClient) => { 
                      client  
                          .api(endUrl)  
                          .select('subject,organizer,start,end,attendees,id,isReminderOn,recurrence')  
                          .get((error: any, eventColl: IEventColl, rawResponse: any) => {
                              eventColl.value.map((item: any) => {  
                                  events.push({                                          
                                      subject: item.subject,  
                                      organizer: item.organizer.emailAddress.name,  
                                      start: item.start.dateTime,  
                                      end: item.end.dateTime  
                                  });  
                              }); 
                              resolve(events); 
                          });  
                  });
          } catch (error) {  
              console.error(error);  
          }  
      });  
  }  
}
