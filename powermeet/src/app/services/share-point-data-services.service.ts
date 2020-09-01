import { Injectable } from '@angular/core';
import { Client } from '@microsoft/microsoft-graph-client';
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";

@Injectable({
  providedIn: 'root'
})
export class SharePointDataServicesService {
  private graphClient: Client;
  notifObj ={
    "fields": {
      "Title": "Notification-title",
      "NotificationDateTime": new Date(),              
      "Active": true,
      "NotificationStatus":"",
      "AssigneeName": sessionStorage.getItem('user')     
    }
  };
  constructor() {
   
    // this.WpContext = context;
  }
  async getMeetings(groupId) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Meetings/items?expand=fields')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get meetings', JSON.stringify(error, null, 2));
    }
  }
  async putMeeting(meetingId,listItem) {
    let token = sessionStorage.getItem('authconfig');
    this.notifObj.fields.NotificationStatus = "Updated Meeting Type for :"+listItem.fields.Title;
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Meetings/items/'+meetingId)
        .update(listItem);
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('update notif response', res);
        });
      return result;
    } catch (error) {
      console.log('Could not update agenda items', JSON.stringify(error, null, 2));
    }
  }
  async getMeetingByID(groupId, meetingId: number) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Meetings/items/' + meetingId + '?expand=fields')
        .get();
      return result;
    } catch (error) {
      console.log('Could not get agenda items', JSON.stringify(error, null, 2));
    }
  }
  async postMeeting(groupId, listItem) {
    let token = sessionStorage.getItem('authconfig');
    this.notifObj.fields.NotificationStatus = "Added Meeting :"+listItem.fields.Title;
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Meetings/items')
        .post(listItem);
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('post notif response', res);
        });
      return result;
    } catch (error) {
      console.log('Could not add meeting', JSON.stringify(error, null, 2));
    }
  }
  async getAgendaItems(groupId, meetingId: number) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Agenda Items/items?expand=fields&$filter=fields/MeetingLookupId eq ' + meetingId)
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get agenda items', JSON.stringify(error, null, 2));
    }
  }
  async getMeetingNotes(meetingId: number) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Notes/items?expand=fields&$filter=fields/MeetingLookupId eq ' + meetingId)
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get notes', JSON.stringify(error, null, 2));
    }
  }
  async getAgendaItemsById(groupId, agendaId: number) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Agenda Items/items/'+agendaId+'?expand=fields')
        .get();
      return result;
    } catch (error) {
      console.log('Could not get agenda items', JSON.stringify(error, null, 2));
    }
  }
  async getAllAgendaItems(groupId) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Agenda Items/items?expand=fields&$top=10')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get note  items', JSON.stringify(error, null, 2));
    }
  }
  async getTemplateAgendas(groupId,templateId) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Template Agenda/items?expand=fields&$filter=fields/TemplateLookupId eq ' + templateId)
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get template items', JSON.stringify(error, null, 2));
    }
  }
  async postTemplateAgenda(groupId, listItem) {
    let token = sessionStorage.getItem('authconfig');
    this.notifObj.fields.NotificationStatus = "Added Template agenda :"+listItem.fields.Title;
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Template Agenda/items')
        .post(listItem);
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('post notif response', res);
        });
      return result;
    } catch (error) {
      console.log('Could not add template items', JSON.stringify(error, null, 2));
    }
  }
  async getTemplates(groupId) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Template/items?expand=fields')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get template items', JSON.stringify(error, null, 2));
    }
  }
  async postTemplate(groupId, listItem) {
    let token = sessionStorage.getItem('authconfig');
    this.notifObj.fields.NotificationStatus = "Added Template :"+listItem.fields.Title;
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Template/items')
        .post(listItem);
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('post notif response', res);
        });
      return result;
    } catch (error) {
      console.log('Could not add template items', JSON.stringify(error, null, 2));
    }
  }
  async postAgendaItem(groupId, listItem) {
    let token = sessionStorage.getItem('authconfig');
    this.notifObj.fields.NotificationStatus = "Added Agenda Item :"+listItem.fields.Title;
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Agenda Items/items')
        .post(listItem);
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('post notif response', res);
        });
      return result;
    } catch (error) {
      console.log('Could not add agenda items', JSON.stringify(error, null, 2));
    }
  }
  async putAgendaItem(groupId, listItem,AgendaId) {
    let token = sessionStorage.getItem('authconfig');
    this.notifObj.fields.NotificationStatus = "Updated Agenda Item :"+listItem.fields.Title;
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Agenda Items/items/'+AgendaId)
        .update(listItem);
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('update notif response', res);
        });
      return result;
    } catch (error) {
      console.log('Could not update agenda items', JSON.stringify(error, null, 2));
    }
  }
  async getUserByEmailID(mail: any) {
    let siteUrl = sessionStorage.getItem('siteUrl');
    sp.setup({
      sp: {
        headers: {
          Accept: "application/json;odata=verbose",
        },
        baseUrl: siteUrl
      }
    });
    // if (typeof mail === "string") {
    const user = await sp.web.siteUsers.getByEmail(mail);
    user().then((data) => {
      console.log('user data', data);
    });
    // }
  }
  async getNotes(groupId, agendaId: number) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Notes/items?expand=fields&$filter=fields/AgendaLookupId eq ' + agendaId)
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get note  items', JSON.stringify(error, null, 2));
    }
  }
  async getExternalNotes(groupId) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Notes/items?expand=fields')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get note  items', JSON.stringify(error, null, 2));
    }
  }
  async postNote(groupId, listItem) {
    let token = sessionStorage.getItem('authconfig');
    this.notifObj.fields.NotificationStatus = "Added Note :"+listItem.fields.Title;
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Notes/items')
        .post(listItem);
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('post notif response', res);
        });
      return result;
    } catch (error) {
      console.log('Could not add note items', JSON.stringify(error, null, 2));
    }
  }
  async putNote(groupId, listItem,NoteID) {
    let token = sessionStorage.getItem('authconfig');
    this.notifObj.fields.NotificationStatus = "Updated Note :"+listItem.fields.Title;
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Notes/items/'+NoteID)
        .update(listItem);
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('post notif response', res);
        });
      return result;
    } catch (error) {
      console.log('Could not put note items', JSON.stringify(error, null, 2));
    }
  }
  async getNotifications(groupId) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Notifications/items?expand=fields&$select=ID,fields&$orderby=ID desc')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get notifications', JSON.stringify(error, null, 2));
    }
  }
  async postNotification(groupId, listItem) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + "54b63089-c127-4cd9-9dd5-72013c0c3eaa" + '/sites/root/lists/Notifications/items')
        .post(listItem);
      return result;
    } catch (error) {
      console.log('Could not add notification items', JSON.stringify(error, null, 2));
    }
  }
  async UploadAttachments(groupId,stream:any,filename:string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {  
        let token = JSON.parse(sessionStorage.getItem('token'));        
        if(token){
          this.graphClient = Client.init({
            authProvider: async (done) => {
              if (token) {done(null, token);}
              else {done("Could not get an access token", null)}
            }
          });
        }
          let result = await this.graphClient
            .api("/groups/54b63089-c127-4cd9-9dd5-72013c0c3eaa/sites/root/drives/b!iWEUljAoAEi_ZCTertMZeN98T_PX2tFLikQM9E-tGxgeVN0HdXUGTZOPcwp9rH4t/items/root:/"+filename+":/content")
            .put(stream)
          resolve(result);           
      } catch (error) {          
          console.error(error);
      }  
    });
  }
  async getAttachmentId(filename:string,driveItem){
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api(`/groups/54b63089-c127-4cd9-9dd5-72013c0c3eaa/sites/root/drives/b!iWEUljAoAEi_ZCTertMZeN98T_PX2tFLikQM9E-tGxgeVN0HdXUGTZOPcwp9rH4t/root/children?$filter=startswith(name,'${filename}')&$expand=listitem`)
        .get();
      let fresult = await this.updateAttachmentMetadata(driveItem,result.value[0].listItem.id);
      return fresult;
    } catch (error) {
      console.log('Could not get attachemtns', JSON.stringify(error, null, 2));
    }
  }
async getAgendaAttachments(agendaId){
  let token = sessionStorage.getItem('authconfig');
  if (token) {
    this.graphClient = Client.init({
      authProvider: async (done) => {
        if (token) { done(null, token); }
        else { done("Could not get an access token", null) }
      }
    });
  }
  try {
    let result = await this.graphClient
      .api('/groups/54b63089-c127-4cd9-9dd5-72013c0c3eaa/sites/root/Lists/Attachments/items?expand=fields&$filter=fields/AgendaLookupId eq ' + agendaId)
      .get();
    return result.value;
  } catch (error) {
    console.log('Could not get attachemtns', JSON.stringify(error, null, 2));
  }
}
  async updateAttachmentMetadata(driveItem: any,itemId:number): Promise<any>{
    return new Promise<any>(async (resolve, reject) => {
      try {  
        let token = JSON.parse(sessionStorage.getItem('token'));       
        if(token){
          this.graphClient = Client.init({
            authProvider: async (done) => {
              if (token) {done(null, token);}
              else {done("Could not get an access token", null)}
            }
          });
        }
        
          let result = await this.graphClient
            .api("/groups/54b63089-c127-4cd9-9dd5-72013c0c3eaa/sites/root/lists/Attachments/items/"+itemId+"/fields")
            .update(driveItem)
          resolve(result);           
      } catch (error) {          
          console.error(error);
      } 
    })
  }
  async deleteListItem(groupId,listName:string,itemId:number, itemName) {
      let token = sessionStorage.getItem('authconfig');
      this.notifObj.fields.NotificationStatus = "Deleted "+listName+" : "+ itemName;     
      if(token){
        this.graphClient = Client.init({
          authProvider: async (done) => {
            if (token) {done(null, token);}
            else {done("Could not get an access token", null)}
          }
        });
      }
      try{
        let result = await this.graphClient.api('/groups/'+"54b63089-c127-4cd9-9dd5-72013c0c3eaa"+'/sites/root/lists/'+listName+'/items/'+itemId)
        .delete();
        this.postNotification(sessionStorage.getItem('"54b63089-c127-4cd9-9dd5-72013c0c3eaa"'),this.notifObj).then(res =>{
          console.log('delete notif response', res);
        });
        return result;
      }
      catch(err){
        console.log('Error while deleting list item id '+itemId+'from list '+listName);
      }      
  }

}
