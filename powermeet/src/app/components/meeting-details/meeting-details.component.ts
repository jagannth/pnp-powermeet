import { Component, OnInit } from '@angular/core';
import { GetAttendiesService } from 'src/app/services/get-attendies.service';
import { AgendaDto } from 'src/app/services/dto';
import { ProxyService } from 'src/app/services/proxy.service';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';
import { AgendaItems } from 'src/app/models/AgendaItem';
import { Meeting } from 'src/app/models/Meeting';
import { AgendaAttendees } from 'src/app/models/AgendaAttendees';
import { AgendaAssignees } from 'src/app/models/AgendaAssigees';
import { Attachments } from 'src/app/models/Attachments';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { User } from 'src/app/models/User';
import { DataService } from 'src/app/services/data.service';
import { Note } from 'src/app/models/Note';
import { timer } from 'rxjs';
import { SharePointDataServicesService } from 'src/app/services/share-point-data-services.service';
import { Template } from '@angular/compiler/src/render3/r3_ast';

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.css']
})
export class MeetingDetailsComponent implements OnInit {

  dt: any;
  loggeduser: any;
  displayform: boolean;
  agendatitle = true;
  displayName: boolean;
  agendaName: string = '';
  templatenamengmodel: string = '';
  audience: boolean;
  divnewtemplate: boolean;
  tempAgenda: any = [];
  listattendies: any = [];
  title = "Agenda Title";
  imgUrl: string = "../../../assets/images/Send-Icon.svg";
  TemplateArray: Array<any> = [];
  templatename: any;
  itemsArray: any = [];
  selectedAgendaItems: any = [];
  AgendaArray: any = [];
  AgendaAssignees: any = [];
  FinalAgendaArray: any = [];
  itemnamess: any;
  fileData: File = null;
  previewUrl: any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  filename: File;
  message: string;

  MeetingObj: any = {};
  meetingDetails: any = {};
  AgendaID: any;
  quickagenda: any;
  Agenda_ID: string;
  AgendaAssigniesList: string;

  //changes by jagannath
  Meeting: Meeting;
  AgendaItem: AgendaItems;
  displayassigniimages: boolean;
  membersemails: any = [];
  notesArray: any = [];
  note: Note;


  constructor(public spinner: NgxSpinnerService, private shrService: SharePointDataServicesService, public proxy: ProxyService, private route: ActivatedRoute, private dataService: DataService) { }
  MeetingID: string = '00000000-0000-0000-0000-000000000000';
  ngOnInit() {
    this.spinner.show();
    this.dt = sessionStorage.getItem('user');
    this.Meeting = new Meeting();
    this.AgendaItem = new AgendaItems();
    this.divnewtemplate = false;
    this.getUsersList();
    this.MeetingObj = JSON.parse(sessionStorage.getItem("meetingobj"));
    this.MeetingID = this.MeetingObj.MeetingID;
    console.log('session meeting object', this.MeetingObj);
    if (this.MeetingID != "00000000-0000-0000-0000-000000000000")
      this.getMeetingById(this.MeetingObj.MeetingID);
    this.proxy.Get("users").subscribe(
      data => {
        this.listattendies = data.Data;
        console.log(this.listattendies);
      }
    );
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }
  getTemplatedetails11() {
    this.shrService.getTemplates(sessionStorage.getItem('groupId')).then(res => {
      console.log('templates res', res);
      res.forEach(x => {
        const temp = { Name: '', AgendaItems: new Array<AgendaItems>() };
        temp.Name = x.fields.Title;
        this.shrService.getTemplateAgendas(sessionStorage.getItem('groupId'), x.fields.id).then(res => {
          console.log('agenda tempkakte res', res);
          res.forEach(y => {
            this.shrService.getAgendaItemsById(sessionStorage.getItem('groupId'), y.fields.AgendaLookupId).then(res => {
              console.log('agenda details', res);
              const agenda = new AgendaItems();
              agenda.AgendaName = res.fields.Title;
              agenda.AgendaDescription = res.fields.AgendaDescription;
              agenda.Duration = res.fields.AgendaDuration;
              agenda.StartTime = res.fields.EndDateTime;
              agenda.EndTime = res.fields.StartDateTime;
              agenda.Status = res.fields.AgendaItemStatus;
              agenda.IsApproved = res.fields.IsApproved;
              temp.AgendaItems.push(agenda);
            });

          });
        })
        this.TemplateArray.push(temp);
      });
    })
  }
  getMeetingById(Id) {
    this.AgendaItem = new AgendaItems();
    this.Meeting = new Meeting();
    this.shrService.getAgendaItems(sessionStorage.getItem('groupId'), Id).then(res => {
      console.log('agenda items res', res);
      res.forEach(x => {
        const agenda = new AgendaItems();
        agenda.AgendaName = x.fields.Title;
        agenda.AgendaDescription = x.fields.AgendaDescription;
        agenda.Duration = x.fields.AgendaDuration;
        agenda.StartTime = x.fields.EndDateTime;
        agenda.EndTime = x.fields.StartDateTime;
        agenda.AgendaID = x.fields.id;
        agenda.AgendaAssignees = new AgendaAssignees();
        agenda.AgendaAssignees.Email = x.fields.AgendaAssignees;
        if(x.fields.AgendaAttendees){
          var nameArr = x.fields.AgendaAttendees.split('|');
          nameArr.forEach(element => {
            const attendee = new AgendaAttendees();
            attendee.Email = element;
            if (element != '') { agenda.AgendaAttendees.push(attendee); }
          });
         }
        agenda.MeetingID = x.fields.MeetingLookupId;
        agenda.Status = x.fields.AgendaItemStatus;
        agenda.IsApproved = x.fields.IsApproved;
        this.Meeting.AgendaItems.push(agenda);
      });
    });
    // this.proxy.Get('meetings/' + Id).subscribe(res => {
    //   this.Meeting = res.Data.Meeting;
    //   console.log('id res', this.Meeting);
    // })
  }
  getTemplateDetails(template) {
    console.log('templatedsss', template);
    this.itemsArray = [];
    this.selectedAgendaItems = [];
    this.templatename = template.Name;
    this.itemsArray = template.AgendaItems;
  }
  addFromExistingTemplates() {
    this.itemsArray = [];
    this.selectedAgendaItems = [];
    this.templatename = "";
    this.itemsArray = []
    this.getTemplatedetails11();
  }
  generateform() {
    this.displayform = true;
    this.agendatitle = false;
  }
  close() {
    this.agendatitle = true;
    this.displayform = false;
    this.displayName = false;
  }
  resetForm() {
    // this.Meeting = new Meeting();
    this.AgendaItem = new AgendaItems();
    this.isEditable = false;
    this.imagesArray = [];
    this.agendatitle = true;
    this.displayName = false;
    this.title = 'Agenda title';

  }
  hiding() {
    if (this.AgendaItem.AgendaName != '') {
      this.displayName = true;
      this.displayform = false;
      document.getElementById("agenda-title").style.border = 'none';
    }
    // console.log(this.agenda.title);
  }

  getAttendee(e) {
    const attendee = new AgendaAttendees();
    attendee.Email = e.userPrincipalName;
    this.AgendaItem.AgendaAttendees.push(attendee);
  }
  getAssignee(e) {
    this.displayassigniimages = true;
    const assignee = new AgendaAssignees();
    assignee.Email = e.userPrincipalName;
    this.AgendaItem.AgendaAssignees = assignee;
    console.log(this.AgendaItem);
  }
  imagesArray: any = [];
  Attachments1: any = [];
  changeFileInput(response: any) {
    console.log('File Input response - ', response);
    if (response.target.files.length > 0) {
      for (let i = 0; i < response.target.files.length; i++) {
        var fileObject = new Attachments();
        var reader = new FileReader();
        reader.readAsDataURL(response.target.files[i]);
        reader.onload = (event) => { // called once readAsDataURL is completed
          const valobj: any = {};
          valobj.name = response.target.files[i].name;
          // valobj.file = event.target.result;  ---resultttttttttttttt
          valobj.type = response.target.files[i].type.slice(0, 5);
          this.imagesArray.push(valobj);
        }
        fileObject.file = response.target.files[i];
        fileObject.AttachmentName = response.target.files[i].name;
        // this.AgendaItem.Attachments.push(fileObject);
        this.Attachments1.push(fileObject);
      }
    }
    console.log('aaaa', this.imagesArray);
  }
  saveAgenda(Id) {
    let attendee: string = '';
    this.AgendaItem.AgendaAttendees.forEach(y => {
      attendee += y.Email + '|';
    });
    this.Meeting.MeetingID = this.MeetingID;
    var listItem = {
      "fields": {
        "Title": this.AgendaItem.AgendaName,
        "AgendaDescription": this.AgendaItem.AgendaDescription,
        "IsApproved": true,
        "AgendaDuration": this.AgendaItem.Duration,
        "AgendaItemStatus": "Completed",
        "StartDateTime": new Date(),
        "EndDateTime": new Date(),
        "MeetingLookupId": this.Meeting.MeetingID,
        "AgendaAttendees": attendee,
        "AgendaAssignees": this.AgendaItem.AgendaAssignees.Email
      }
    };
    if (Id == 1) {
      listItem = {
        "fields": {
          "Title": this.agendaName,
          "AgendaDescription": this.agendaName,
          "IsApproved": true,
          "AgendaDuration": "5 Mins",
          "AgendaItemStatus": "Completed",
          "StartDateTime": new Date(),
          "EndDateTime": new Date(),
          "MeetingLookupId": this.Meeting.MeetingID,
          "AgendaAttendees": sessionStorage.getItem('user'),
          "AgendaAssignees": sessionStorage.getItem('user')
        }
      };
    }
    console.log('thisstart', listItem);
    if (this.isEditable == false) {
      this.shrService.postAgendaItem(sessionStorage.getItem('groupId'), listItem).then(res => {
        console.log('post agenda', res);
        this.agendaName = '';
        this.agendaResponse(res, false, 0);
      });
    } else {
      this.shrService.putAgendaItem(sessionStorage.getItem('groupId'), listItem, this.AgendaItem.AgendaID).then(res => {
        console.log('put agenda', res);
        const inx = this.Meeting.AgendaItems.findIndex(x => x.AgendaID == this.AgendaItem.AgendaID);
        this.agendaResponse(res, true, inx);
      });
    }
    this.resetForm();

    (<HTMLButtonElement>document.getElementById('closeBtn')).click();
    this.spinner.hide();
  }
  agendaResponse(res, status, inx) {
    const agenda = new AgendaItems();
    agenda.AgendaName = res.fields.Title;
    agenda.AgendaDescription = res.fields.AgendaDescription;
    agenda.Duration = res.fields.AgendaDuration;
    agenda.StartTime = res.fields.EndDateTime;
    agenda.EndTime = res.fields.StartDateTime;
    agenda.AgendaID = res.fields.id;
    agenda.AgendaAssignees = new AgendaAssignees();
    agenda.AgendaAssignees.Email = res.fields.AgendaAssignees;
    if(res.fields.AgendaAttendees){
      var nameArr = res.fields.AgendaAttendees.split('|');
      nameArr.forEach(element => {
        const attendee = new AgendaAttendees();
        attendee.Email = element;
        if(element != '' && element != 'TestSite99@sticsoft.io') { agenda.AgendaAttendees.push(attendee); }
      });
    }
    agenda.MeetingID = res.fields.MeetingLookupId;
    agenda.Status = res.fields.AgendaItemStatus;
    agenda.IsApproved = res.fields.IsApproved;
    if (status == false) {
      this.Meeting.AgendaItems.push(agenda);
    } else {
      this.Meeting.AgendaItems[inx] = agenda;
    }
  }
  itemsChange(e, item, i) {
    // console.log(item)
    if (e.target.checked) {
      this.selectedAgendaItems.push(item)
    }
    else {
      let index = this.selectedAgendaItems.findIndex(x => x === item);
      //  console.log(index)
      this.selectedAgendaItems.splice(index, 1);
    }
    console.log('selecteditmes', this.selectedAgendaItems);
  }
  addToAgendaArray() {
    this.selectedAgendaItems.forEach(x => {
      const listItem = {
        "fields": {
          "Title": x.AgendaName,
          "AgendaDescription": x.AgendaDescription,
          "IsApproved": true,
          "AgendaDuration": x.Duration,
          "AgendaItemStatus": "Completed",
          "StartDateTime": new Date(),
          "EndDateTime": new Date(),
          "MeetingLookupId": this.MeetingID,
          "AgendaAttendees": sessionStorage.getItem('user'),
          "AgendaAssignees": sessionStorage.getItem('user')
        }
      };
      console.log('agenda item', listItem);
      this.shrService.postAgendaItem(sessionStorage.getItem('groupId'), listItem).then(res => {
        const agenda = new AgendaItems();
        agenda.AgendaName = res.fields.Title;
        agenda.AgendaDescription = res.fields.AgendaDescription;
        agenda.Duration = res.fields.AgendaDuration;
        agenda.StartTime = res.fields.EndDateTime;
        agenda.EndTime = res.fields.StartDateTime;
        agenda.AgendaID = res.fields.id;
        agenda.AgendaAssignees = new AgendaAssignees();
        agenda.AgendaAssignees.Email = res.fields.AgendaAssignees;
        agenda.MeetingID = res.fields.MeetingLookupId;
        agenda.Status = res.fields.AgendaItemStatus;
        agenda.IsApproved = res.fields.IsApproved;
        this.Meeting.AgendaItems.push(agenda);
      });

    });
  }

  deleteagenda(agenda) {
    this.Agenda_ID = agenda.AgendaID;
    this.itemnamess = agenda.AgendaName;
  }

  deleteAgenda() {
    console.log(this.Agenda_ID);
    this.shrService.deleteListItem(sessionStorage.getItem('groupId'), "Agenda Items", parseInt(this.Agenda_ID), this.itemnamess).then(res => {
      console.log('deleted response', res);
      const inx = this.Meeting.AgendaItems.findIndex(x => x.AgendaID == this.Agenda_ID);
      this.Meeting.AgendaItems.splice(inx, 1);
    });
    // this.proxy.Delete("meetings/agenda/" + this.Agenda_ID).subscribe(res => {
    //   console.log('Agenda delete post response :', res);
    //   this.getMeetingById(this.MeetingObj.MeetingID);
    // });
  }

  checkDisable() {
    if (this.AgendaItem.AgendaName == '' || this.AgendaItem.AgendaName == undefined) {
      this.imgUrl = "../../../assets/images/Send-Icon.svg";
      return true;
    } else {
      this.imgUrl = "../../../assets/images/Send-Icon-color.svg";
      return false;
    }
  }
  isEditable: boolean = false;

  colorsArray: any = ['lightgray', 'darkcyan', 'crimson', 'chocolate', 'darkgoldenrod', 'blue', 'purple', 'brown', 'chartreuse']
  editagenda(edit) {
    this.Attachments1 = [];
    this.isEditable = true;
    // this.displayform = true;
    this.AgendaItem = edit;
    this.title = this.AgendaItem.AgendaName;
    console.log('this.edit', this.AgendaItem);
    // this.agendatitle = false;
    // // this.title = edit;
    // this.agenda.title = edit.AgendaName;
    // this.agenda.description = edit.AgendaDescription;
    // this.agenda.duration = edit.Duration;
    // this.AgendaID = edit.AgendaID;
  }
  getImage(name) {
    const types = ['png', 'jpg', 'jpeg', 'jfif', 'gif'];
    // const image: string = 'https://powermeetblobstorage.blob.core.windows.net/powermeetblobstorage/' + name + '?sv=2019-02-02&ss=bqtf&srt=sco&sp=rwdlacup&se=2020-03-04T19:07:17Z&sig=nV0F%2FXxXX6ugZUDdcoZKrrD0Smpl3UFfD6Zk5bihAnQ%3D&_=1583320073253';
    const image: string = 'https://powermeetblob.blob.core.windows.net/powermeet-blob/' + name;
    var res = name.split(".");
    const type = types.find(x => x == (res[res.length - 1]).toLowerCase());
    console.log(type);
    if (type) {
      return { path: image, status: true }
    } else {
      return { path: image, status: false }
    }
  }
  displayassignies() {
    console.log("assign");
    console.log(this.MeetingObj.AgendaItems);
    for (let index = 0; index < this.MeetingObj.AgendaItems.length; index++) {
      this.AgendaAssigniesList += this.MeetingObj.AgendaItems[index].AgendaName + ',';
    }
    console.log(this.AgendaAssigniesList);
    (<HTMLInputElement>document.getElementById("openModel")).click();

  }
  removeAssignies() {
    this.AgendaAssigniesList = "";
    (<HTMLInputElement>document.getElementById("closeModal")).click();
  }

  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.filename = <File>fileInput.target.files[0].name;
    console.log(this.filename);
    if (this.filename != null) {
      this.message = "sucess";

    }
    else {
      this.message = "fail";
    }
    this.preview();
  }

  preview() {
    // Show preview 
    var mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
    }
  }
  openmembermodal(e) {
    console.log(e)
    for (let i = 2; i < e.length; i++) {
      const val = this.membersemails.find(x => x == e[i].Email);
      if (!val) {
        this.membersemails.push(e[i].Email)
      }
    }
    console.log(this.membersemails)
  }
  clearmembers() {
    this.membersemails = [];
  }
  Shownewtemplate(obj) {
    this.divnewtemplate = obj;
    this.selectedAgendaItems = [];
    if (obj) {
      this.shrService.getAllAgendaItems(sessionStorage.getItem('groupId')).then(res => {
        console.log('agenda items res', res);
        res.forEach(x => {
          const agenda = new AgendaItems();
          agenda.AgendaName = x.fields.Title;
          agenda.AgendaDescription = x.fields.AgendaDescription;
          agenda.Duration = x.fields.AgendaDuration;
          agenda.StartTime = x.fields.EndDateTime;
          agenda.EndTime = x.fields.StartDateTime;
          agenda.AgendaID = x.fields.id;
          agenda.AgendaAssignees = new AgendaAssignees();
          agenda.AgendaAssignees.Email = x.fields.AgendaAssignees;
         if(x.fields.AgendaAttendees){
          var nameArr = x.fields.AgendaAttendees.split('|');
          nameArr.forEach(element => {
            const attendee = new AgendaAttendees();
            attendee.Email = element;
            if (element != '') { agenda.AgendaAttendees.push(attendee); }
          });
         }
          agenda.MeetingID = x.fields.MeetingLookupId;
          agenda.Status = x.fields.AgendaItemStatus;
          agenda.IsApproved = x.fields.IsApproved;
          this.tempAgenda.push(agenda);
        });
      });
    }
  }
  getTempateAgenda() {
    this.shrService.getTemplateAgendas(sessionStorage.getItem('groupId'), 1).then(res => {
      console.log('tempaltes response', res);
    })
  }
  postTemplate() {

  }
  Savetemplate() {
    this.spinner.show();
    const listItem = {
      "fields": {
        "Title": this.templatenamengmodel
      }
    };
    this.shrService.postTemplate(sessionStorage.getItem('groupId'), listItem).then(res => {
      console.log('post template response', res);
      this.selectedAgendaItems.forEach(x => {
        const tempItem = {
          "fields": {
            "Title": this.templatenamengmodel,
            "TemplateLookupId": res.fields.id,
            "AgendaLookupId": x.AgendaID
          }
        };
        this.shrService.postTemplateAgenda(sessionStorage.getItem('groupId'), tempItem).then(res => {
          console.log('post template-agenda response', res);
        });
      });
    });
    setTimeout(() => {
      this.Shownewtemplate(false);
      this.TemplateArray = [];
      this.getTemplatedetails11();
      this.spinner.hide();
    }, 2000);
    // let tempobj: any = {};
    // tempobj.TemplateID = "";
    // tempobj.Name = this.templatenamengmodel;
    // tempobj.CreatedBy = "Azure";
    // tempobj.CreatedDate = new Date();
    // tempobj.AgendaItems = this.selectedAgendaItems;
    // this.proxy.Post('templates', tempobj).subscribe(res => {
    //   this.getTemplatedetails11();
    //   this.spinner.hide();
    // });
  }
  ConvertTolocal(datestr) {
    // let yourDate = new Date(datestr);
    // console.log('MetingDatetiem', yourDate.toDateString());
    // console.log('TodayDatetiem', new Date().toDateString());
    // return yourDate.toDateString();
    return moment.utc(datestr).local().format('MM/DD/YYYY HH:mm');
    //return formatDate(datestr, 'yyyy/MM/dd HH:MM', 'en');
  }
  usersList: Array<User>;
  getUsersList() {
    this.dataService.data.subscribe(res => {
      this.usersList = res;
    });
  }
  getStatus(email): User {
    const data = this.usersList.find(x => x.email === email);
    return data;
  }
  noteDescription: any;
  collapse: number = 12;
  isActive: boolean = false;
  agendaInx: number = 0;

  getNotes(inx) {
    this.note = new Note();
    this.collapse = 6;
    this.isActive = true;
    this.agendaInx = inx;
    this.proxy.Get('meetings/notes/' + this.Meeting.AgendaItems[inx].AgendaID).subscribe(res => {
      console.log('notes response', res);
      this.notesArray = res.Data;
    });
  }
  addNotes() {
    this.note.AgendaID = this.Meeting.AgendaItems[this.agendaInx].AgendaID;
    this.note.Description = this.noteDescription;
    console.log('this.note', this.note);
    this.proxy.Post('meetings/notes', this.note).subscribe(res => {
      console.log('post note res', res);
      this.getNotes(this.agendaInx);
    })

  }
  progressColor: string = '';
  timeLeft: number = 0;
  interval;
  colorInx: number;
  timeObject: any = { min: 0, sec: 0 }
  toggleReturn() {
    this.isActive = false;
    this.collapse = 12;
  }
  startTimer(inx, value) {
    this.pauseTimer();
    const res = parseInt(value.slice(0, 2)) * 60;
    this.timeLeft = 0;
    console.log(res);
    this.colorInx = inx;
    this.interval = setInterval(() => {
      if (this.timeLeft < res) {
        this.timeLeft++;
        const val = (this.timeLeft / res) * 100
        this.progressColor = 'linear-gradient(to right,green ' + val + '%,lightgreen ' + val + '%)';
      }
    }, 1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
  }
}
