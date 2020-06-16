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
  tempAgenda: any;
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
  Agenda_ID: any;
  AgendaAssigniesList: string;

  //changes by jagannath
  Meeting: Meeting;
  AgendaItem: AgendaItems;
  displayassigniimages: boolean;
  membersemails: any = [];
  notesArray: any = [];
  note: Note;

  constructor(public spinner: NgxSpinnerService, private getattendies: GetAttendiesService, public proxy: ProxyService, private route: ActivatedRoute, private dataService: DataService) { }
  MeetingID: string = '00000000-0000-0000-0000-000000000000';
  ngOnInit() {
    this.spinner.show();
    this.dt = sessionStorage.getItem('user');
    this.Meeting = new Meeting();
    this.AgendaItem = new AgendaItems();
    console.log('agenda item', this.AgendaItem);
    this.notesArray = new Array<Note>();
    this.divnewtemplate = false;
    this.getUsersList();
    // this.route.queryParams
    //   .filter(params => params.Id)
    //   .subscribe(params => {
    //     //this.MeetingObj = JSON.parse(params.Id);
    //     console.log("asdadad",JSON.parse(params.Id));

    //     if(this.MeetingObj.MeetingID !== "")
    //         this.getMeetingById(params.Id);
    //   });
    this.MeetingObj = JSON.parse(sessionStorage.getItem("meetingobj"));
    this.MeetingID = this.MeetingObj.MeetingID;
    console.log('Meetingobjjjj', this.MeetingObj);
    if (this.MeetingID != "00000000-0000-0000-0000-000000000000")
      this.getMeetingById(this.MeetingObj.MeetingID);
    this.proxy.Get("users").subscribe(
      data => {
        this.listattendies = data.Data;
        console.log(this.listattendies);
      }
    )
    this.spinner.hide();
  }
  getTemplatedetails11() {
    this.proxy.Get('templates').subscribe(res => {
      console.log('Templates :', res.Data);
      // this.TemplateArray = res.Data; ---resultttttttttttttt
      //this.getMeetingById(this.MeetingObj.MeetingID);

    })
  }
  getMeetingById(Id) {
    this.AgendaItem = new AgendaItems();
    this.Meeting = new Meeting();
    this.proxy.Get('meetings/' + Id).subscribe(res => {
      this.Meeting = res.Data.Meeting;
      console.log('id res', this.Meeting);
    })
  }
  getTemplateDetails(template) {
    this.itemsArray = [];
    this.selectedAgendaItems = [];
    this.templatename = template.Name;
    this.itemsArray = template.AgendaItems;
    console.log('templatedsss', template);
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
    console.log('thisstart', this.AgendaItem);
    this.Meeting.MeetingID = this.MeetingID;
    console.log('meetingggg id', this.MeetingID);
    if (Id == 1) {
      this.AgendaItem.AgendaName = this.agendaName;
      this.AgendaItem.AgendaDescription = this.AgendaItem.AgendaName;
      this.AgendaItem.AgendaAssignees = {
        AgendaAssigneesID: "00000000-0000-0000-0000-000000000000",
        AgendaID: "00000000-0000-0000-0000-000000000000",
        Email: sessionStorage.getItem('user')
      }
    }
    this.spinner.show();
    if (this.MeetingID == "00000000-0000-0000-0000-000000000000") {
      this.Meeting = this.MeetingObj;
      this.Meeting.Organizer = sessionStorage.getItem('user');
      this.Meeting.UserName = sessionStorage.getItem('user');
      this.Meeting.MeetingID = this.MeetingID;
      this.AgendaItem.MeetingID = '00000000-0000-0000-0000-000000000000';
      // this.AgendaItem.Duration = "2020-02-25 10:20:20.330";
      this.AgendaItem.Status = "Completed";
      this.Meeting.AgendaItems.push(this.AgendaItem);
      this.Meeting.MeetingAttendees.forEach(x => {
        x.MeetingAttendeesID = '00000000-0000-0000-0000-000000000000';
        x.MeetingID = '00000000-0000-0000-0000-000000000000';
      })
      console.log('meeting send object', this.Meeting);
      var frmData = new FormData();
      const ResponseObject: string = JSON.stringify(this.Meeting);
      frmData.append('meetingResponse', ResponseObject);
      if (this.Attachments1 !== null && this.Attachments1.length > 0) {
        this.Attachments1.forEach((file,index) => {
          this.AgendaItem.Attachments.push(file);
          frmData.append(index.toString(), file.file, file.file.name);
        });
      }
      this.proxy.Post('meetings', frmData).subscribe(res => {
        console.log('meeting response after save', res);
        this.MeetingID = res.Data.Meeting.MeetingID;
        this.Meeting = res.Data.Meeting;
        this.agendaName = '';
        console.log('meeting id', this.MeetingID);
        this.getMeetingById(this.MeetingID);
        (<HTMLButtonElement>document.getElementById('closeBtn')).click();
        this.spinner.hide();
      })
    } else {
      this.AgendaItem.MeetingID = this.MeetingID;
      this.AgendaItem.Status = "Completed";
      this.AgendaItem.UserName = sessionStorage.getItem('user');
      var frmData = new FormData();
      const ResponseObject: string = JSON.stringify(this.AgendaItem);
      frmData.append('agendaResponse', ResponseObject);
      console.log('fileattach', this.AgendaItem.Attachments);
      if (this.Attachments1 !== null && this.Attachments1.length > 0) {
        this.Attachments1.forEach((file, index) => {
          this.AgendaItem.Attachments.push(file);
          console.log('filedata', file);
          if (file.file !== undefined)
            frmData.append(index.toString(), file.file, file.file.name);
        });
      }
      console.log('agenda - form data', frmData);
      this.proxy.Post('meetings/agenda', frmData).subscribe(res => {
        console.log('Agendas post response :', res);
        this.getMeetingById(this.MeetingID);
        (<HTMLButtonElement>document.getElementById('closeBtn')).click();
        this.spinner.hide();
      });
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
    for (let i = 0; i < this.selectedAgendaItems.length; i++) {
      //this.AgendaArray.push(this.selectedAgendaItems[i]);
      this.AgendaItem = this.selectedAgendaItems[i];
      this.AgendaItem.AgendaAssignees = {
        AgendaAssigneesID: "00000000-0000-0000-0000-000000000000",
        AgendaID: "00000000-0000-0000-0000-000000000000",
        Email: sessionStorage.getItem('user')
      }
      // console.log('thisagenda',AgendaObj);
      this.saveAgenda(2);

      //   "AgendaID": "",
      //   "AgendaName": this.selectedAgendaItems[i].agendaName,
      //   "AgendaDescription": "",
      //   "StartTime": "2020-02-25T11:07:07.323",
      //   "EndTime": "2020-02-25T11:07:07.323",
      //   "AttachmentID": "1bd9cb80-5830-406d-9656-5127f36d1e53",
      //   "MeetingID": this.MeetingObj.MeetingID,
      //   "Duration": "2020-02-25T11:07:07.323",
      //   "TemplateID": "0643b9c5-e33a-400d-bbea-6cde37d8a0dd",
      //   "Status": "Completed",
      //   "IsApproved": true,
      //   "AgendaAssignees": {
      //     "AgendaAssigneesID": "00000000-0000-0000-0000-000000000000",
      //     "AgendaID": "70357a0f-a4d7-4b1a-bb1d-048e3966c250",
      //     "Email": "Vinay.kumar@sticsoftsolutions.com",
      //     "Errors": []
      //   },
      //   "AgendaAttendees": []
      // }
      // console.log(AgendaObj);
      // this.proxy.Post('meetings/agenda', AgendaObj).subscribe(res => {
      //   console.log('Agendas post response :', res);
      //   this.getMeetingById(this.MeetingObj.MeetingID);
      // })
    }
    //  console.log(this.AgendaArray);
  }

  deleteagenda(agenda) {
    this.Agenda_ID = agenda.AgendaID;
    this.itemnamess = agenda.AgendaName;
  }

  deleteAgenda() {
    console.log(this.Agenda_ID);
    this.proxy.Delete("meetings/agenda/" + this.Agenda_ID).subscribe(res => {
      console.log('Agenda delete post response :', res);
      this.getMeetingById(this.MeetingObj.MeetingID);
    })
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
    const types = ['png','jpg', 'jpeg','jfif','gif'];
    // const image: string = 'https://powermeetblobstorage.blob.core.windows.net/powermeetblobstorage/' + name + '?sv=2019-02-02&ss=bqtf&srt=sco&sp=rwdlacup&se=2020-03-04T19:07:17Z&sig=nV0F%2FXxXX6ugZUDdcoZKrrD0Smpl3UFfD6Zk5bihAnQ%3D&_=1583320073253';
    const image: string = 'https://powermeetblob.blob.core.windows.net/powermeet-blob/' + name;
    var res = name.split(".");
    const type = types.find(x=> x == (res[res.length-1]).toLowerCase());
    console.log(type);
    if(type){
      return {path: image, status: true}
    }else{
      return {path: image, status: false}
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
      this.proxy.Get('templates/agenda').subscribe(res => {
        this.tempAgenda = res.Data;

        console.log('TemplateAgendas', this.selectedAgendaItems);
      })
    }
  }
  Savetemplate() {
    this.spinner.show();
    let tempobj: any = {};
    tempobj.TemplateID = "";
    tempobj.Name = this.templatenamengmodel;
    tempobj.CreatedBy = "Azure";
    tempobj.CreatedDate = new Date();
    tempobj.AgendaItems = this.selectedAgendaItems;
    this.proxy.Post('templates', tempobj).subscribe(res => {
      this.getTemplatedetails11();
      this.spinner.hide();
    })
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
