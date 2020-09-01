import { GraphService } from 'src/app/services/graph.service';
import { Meeting } from './../../models/Meeting';
import { ProxyService } from './../../services/proxy.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/User';
import { DataService } from 'src/app/services/data.service';
import { Note } from 'src/app/models/Note';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteAudit } from 'src/app/models/NoteAudit';
import { SharePointDataServicesService } from 'src/app/services/share-point-data-services.service';
import { AgendaItems } from 'src/app/models/AgendaItem';
import { AgendaDto } from 'src/app/services/dto';
import { AgendaAssignees } from 'src/app/models/AgendaAssigees';
import { AgendaAttendees } from 'src/app/models/AgendaAttendees';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { MeetingAttendees } from 'src/app/models/MeetingAttendees';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Attachments } from 'src/app/models/Attachments';
import * as Chart from 'chart.js';
import { MultiDataSet, Label, Colors } from 'ng2-charts';
import { ChartType, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-agenda-notes',
  templateUrl: './agenda-notes.component.html',
  styleUrls: ['./agenda-notes.component.css']
})
export class AgendaNotesComponent implements OnInit {
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'bottom',
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    }
  };
  public pieChartLabels: Label[] = ['Risk', 'Action', 'Decision'];
  public pieChartData: number[] = [30, 60, 10];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartColors = [
    {
      backgroundColor: ['#e65124', '#ec7f22', '#006a9e'],
    },
  ];

  public pieChartLabels2: Label[] = ['Planned', 'In-Progress', 'Completed'];
  public pieChartData2: number[] = [20, 20, 60];
  public pieChartColors2 = [
    {
      backgroundColor: ['#7d7d7d', '#c5c5c5', '#f4f3f3'],
    },
  ];

  constructor(private proxy: ProxyService,public spinner :NgxSpinnerService, private dataService: DataService, private graphService: GraphService, private route: ActivatedRoute, private shrService: SharePointDataServicesService, private fb: FormBuilder, private graphSrv: GraphService, public router: Router) { 
    this.noteForm = this.fb.group({
      Description: '',
      Type: '',
      Status: '',
      AssignedTo: '',
      AssignedDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
      DueDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
      NoteID: ''
    });
  }
  
  noteForm: FormGroup;
  meetingObject: Meeting;
  noteDescription: any;
  agendaInx: number = 0;
  notesArray = [];
  noteDetail: Note;
  username: string;
  imgUrl: string = "../../../assets/images/Send-Icon.svg";
  colorsArray: any = ['lightgray', 'darkcyan', 'crimson', 'chocolate', 'darkgoldenrod', 'blue', 'purple', 'brown', 'chartreuse'];
  timer: any = { status: 'Start Meeting', time: '23' };
  currentUrl : string = window.location.href;
  ngOnInit(): void {
    this.spinner.show();
    console.log('(this.router.url).slice(0, 6)', this.router.url.slice(0, 6));
    if((this.router.url).slice(0, 6) == '/Notes'){
      document.getElementById('todayactive').classList.add('active');
    }
    this.meetingObject = new Meeting();
    this.username = sessionStorage.getItem('user');
    this.noteDetail = new Note();
    this.getUsersList();
    this.route.queryParams.subscribe(params => {
      this.getMeetingByID(params.Id, params.start);
      console.log('params', params);
    });
    sessionStorage.removeItem('subEntityId');
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
    // document.getElementById('addMoreBtn').click();
    // document.getElementById('descToggle').style.display = 'none';
    // document.getElementById('descToggleImg').style.display = 'none';
  }
  addNoteBt() {
    document.getElementById('addMoreBtn').click();
  }
  getMeetingByID(Id, start) {
    // this.proxy.Get('meetings/' + Id).subscribe(res => {
    //   console.log('response', res);
    //   this.meetingObject = res.Data.Meeting;
    //   this.getNotes(0);
    // })
    this.shrService.getMeetingByID(sessionStorage.getItem('groupId'), parseInt(Id)).then(res => {
      console.log('resssss by id', res);
      this.meetingObject.MeetingID = res.fields.id;
      this.meetingObject.MeetingName = res.fields.Title;
      this.meetingObject.MeetingDescription = res.fields.MeetingDescription;
      this.meetingObject.StartDate = res.fields.StartDateTime;
      this.meetingObject.EndDate = res.fields.EndDateTime;
      if (res.fields.MeetingAttendees) {
        var nameArr = res.fields.MeetingAttendees.split('|');
        nameArr.forEach(element => {
          const attendee = new MeetingAttendees();
          attendee.Email = element;
          console.log('element', element);
          if (element != '' && element != 'TestSite99@sticsoft.io') { this.meetingObject.MeetingAttendees.push(attendee); }
        });
      }
      console.log('element', this.meetingObject.MeetingAttendees);
      this.shrService.getAgendaItems(sessionStorage.getItem('groupId'), parseInt(Id)).then(res => {
        console.log('agenda items res', res);
        if(res.length == 0){
          this.externalNotes();
        }
        res.forEach(x => {
          const agenda = new AgendaItems();
          agenda.AgendaName = x.fields.Title;
          agenda.AgendaDescription = x.fields.AgendaDescription;
          agenda.Duration = x.fields.AgendaDuration;
          // agenda.StartTime = x.fields.EndDateTime;
          // agenda.EndTime = x.fields.StartDateTime;
          agenda.AgendaID = x.fields.id;
          agenda.AgendaAssignees = new AgendaAssignees();
          agenda.AgendaAssignees.Email = x.fields.AgendaAssignees;
          var nameArr = x.fields.AgendaAttendees.split('|');
          nameArr.forEach(element => {
            const attendee = new AgendaAttendees();
            attendee.Email = element;
            if (element != '') { agenda.AgendaAttendees.push(attendee); }
          });
          agenda.MeetingID = x.fields.MeetingLookupId;
          agenda.Status = x.fields.AgendaItemStatus;
          agenda.IsApproved = x.fields.IsApproved;
          this.meetingObject.AgendaItems.push(agenda);
        });
        if (start == 'true') {
          this.startMeeting(0);
        }
        setTimeout(() => {
         if(this.meetingObject.AgendaItems.length > 0){ this.getNotes(0);}
        }, 1000);
      });
    });
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
  deleteNote(note: Note) {
    this.shrService.deleteListItem(sessionStorage.getItem('groupId'), "Notes", parseInt(note.NoteID), "Note").then(res => {
      console.log('deleted note res', res);
      const inx = this.notesArray.findIndex(x => x.NoteID == note.NoteID);
      this.notesArray.splice(inx, 1);
    })
  }
  isEdited: boolean = false;
  editNote(note: Note) {
    this.isEdited = true;
    this.noteDetail = note;
   if(this.meetingObject.AgendaItems.length > 0){
    document.getElementById('addMoreBtn').click();
   }
    console.log('noteeee details', this.noteDetail);
  }
  addNotes(toggle: number, type: string) {
    console.log('this.note', this.noteDetail);
    const user = this.usersList.find(x=> x.email == sessionStorage.getItem('user'));
    // this.noteDetail.NoteAudit = new NoteAudit();
    // this.noteDetail.AgendaID = this.meetingObject.AgendaItems[this.agendaInx].AgendaID;
    var id =  '0';
    if(type != 'External'){
     id = this.meetingObject.AgendaItems[this.agendaInx].AgendaID;
    }
    // this.noteDetail.Status = 'Planned';
    let listItem = {
      "fields": {
        "Title": this.meetingObject.MeetingName,
        "NoteDescription": this.noteDetail.Description,
        "Type": this.noteDetail.Type,
        "AssignedDate": this.noteDetail.AssignedDate,
        "NoteStatus": this.noteDetail.Status,
        "AgendaLookupId":id,
        "CustomDueDate": this.noteDetail.DueDate,
        "CustomAssignedTo": this.noteDetail.AssignedTo,
        "MeetingLookupId":this.meetingObject.MeetingID
      }
    };
    if (this.isEdited == false) {
      this.shrService.postNote(sessionStorage.getItem('groupId'), listItem).then(res => {
        console.log('post notes response', res);
        let body =  {
          "body": {
              "content": `<at id=\"0\">${user.fullname}</at> added a Note : <a href='https://teams.microsoft.com/l/entity/af49f63f-8dd5-417b-b3f5-96658fa88dbd/_djb2_msteams_prefix_2521105317?context=%7B%22subEntityId%22%3A${this.meetingObject.MeetingID}%2C%22channelId%22%3A%2219%3A66897d02aa6745428f4c8117cc197f39%40thread.tacv2%22%7D&groupId=54b63089-c127-4cd9-9dd5-72013c0c3eaa&tenantId=84a9843b-0b29-4729-ba8a-8155cf55c7ae'>${this.noteDetail.Description}</a>`,
              "contentType": "html"
          },
          "mentions": [
              {
                  "id": 0,
                  "mentionText": user.fullname,
                  "mentioned": {
                      "user": {
                          "displayName": user.fullname,
                          "id": user.id,
                          "userIdentityType": "aadUser"
                      }
                  }
              }
          ]
      }
        this.graphSrv.postChannelMessage(body).then(res=>{
          console.log('Channel message res', res);
        });
        this.noteResponse(res, toggle, false,id);
      });
    } else {
      this.shrService.putNote(sessionStorage.getItem('groupId'), listItem, this.noteDetail.NoteID).then(res => {
        console.log('put notes response', res);
        let body =  {
          "body": {
              "content": `<at id=\"0\">${user.fullname}</at> added a Note : <a href='https://teams.microsoft.com/l/entity/af49f63f-8dd5-417b-b3f5-96658fa88dbd/_djb2_msteams_prefix_2521105317?context=%7B%22subEntityId%22%3A${this.meetingObject.MeetingID}%2C%22channelId%22%3A%2219%3A66897d02aa6745428f4c8117cc197f39%40thread.tacv2%22%7D&groupId=54b63089-c127-4cd9-9dd5-72013c0c3eaa&tenantId=84a9843b-0b29-4729-ba8a-8155cf55c7ae'>${this.noteDetail.Description}</a>`,
              "contentType": "html"
          },
          "mentions": [
              {
                  "id": 0,
                  "mentionText": user.fullname,
                  "mentioned": {
                      "user": {
                          "displayName": user.fullname,
                          "id": user.id,
                          "userIdentityType": "aadUser"
                      }
                  }
              }
          ]
      }
        this.graphSrv.postChannelMessage(body).then(res=>{
          console.log('Channel message res', res);
        });
        this.noteResponse(res, toggle, true,id);
      });
    }

  }
  noteResponse(res, toggle, status,id) {
    const note = new Note();
    note.AgendaID = id;
    note.NoteID = res.fields.id;
    note.Description = res.fields.NoteDescription;
    note.Status = res.fields.NoteStatus;
    note.AssignedTo = res.fields.CustomAssignedTo;
    note.AssignedDate = res.fields.AssignedDate;
    note.DueDate = res.fields.CustomDueDate;
    note.Type = res.fields.Type;
    if (status == false) {
      this.notesArray.push(note);
    } else {
      const inx = this.notesArray.findIndex(x => x.NoteID == note.NoteID);
      this.notesArray[inx] = note;
    }
    this.noteDetail = new Note();
    if (toggle == 1) {
      document.getElementById('addMoreBtn').click();
    }
    this.isEdited = false;
  }
  getNotes(inx) {
    this.agendaInx = inx;
    this.notesArray = [];
    console.log('agenda id', this.meetingObject.AgendaItems[inx].AgendaID);
    this.shrService.getNotes(sessionStorage.getItem('groupId'), parseInt(this.meetingObject.AgendaItems[inx].AgendaID)).then(res => {
      console.log('get notes by agenda id', res);
      res.forEach(y => {
        const note = new Note();
        note.AgendaID = this.meetingObject.AgendaItems[inx].AgendaID;
        note.NoteID = y.fields.id;
        note.Description = y.fields.NoteDescription;
        note.Status = y.fields.NoteStatus;
        note.AssignedTo = y.fields.CustomAssignedTo;
        note.AssignedDate = y.fields.AssignedDate;
        note.DueDate = y.fields.CustomDueDate;
        note.Type = y.fields.Type;
        this.notesArray.push(note);
      });
    });
    // this.proxy.Get('meetings/notes/' + this.meetingObject.AgendaItems[inx].AgendaID).subscribe(res => {
    //   console.log('notes', res.Data);
    //   this.notesArray = res.Data;
    // });
  }
  externalNotes(){
    this.shrService.getExternalNotes(sessionStorage.getItem('groupId')).then(res => {
      console.log('external notes', res);
      res.forEach(y => {
        if(y.fields.Title == this.meetingObject.MeetingName){
          const note = new Note();
          note.NoteID = y.fields.id;
          note.Description = y.fields.NoteDescription;
          note.Status = y.fields.NoteStatus;
          note.AssignedTo = y.fields.CustomAssignedTo;
          note.AssignedDate = y.fields.AssignedDate;
          note.DueDate = y.fields.CustomDueDate;
          note.Type = y.fields.Type;
          this.notesArray.push(note);
        }
      });
    });
  }
  getReportNotes(Id) {
    this.proxy.Get('meetings/notes/' + Id).subscribe(res => {
      if (res) return res.Data;
      return [];
    });
  }
  colpsBtn: number = 0;
  collpsHeight: string = '22rem';
  progressColor: string = '';
  timeLeft: number = 0;
  interval;
  colorInx: number;
  noteTxt: string = '';
  collapseBtn() {
    this.colpsBtn++;
    if (this.colpsBtn % 2 == 0) {
      this.collpsHeight = '20rem';
      // document.getElementById('descToggle').style.display = 'block';
      // document.getElementById('descToggleImg').style.display = 'block';
      // document.getElementById('quick').style.display = 'block';
      // document.getElementById('quick-func').style.display = 'block';
      document.getElementById('noteList').style.display = 'block';
      document.getElementById('agenda-desc').style.display = 'block';
      document.getElementById('agenda-att').style.display = 'block';
      this.noteTxt = "";
    }
    else {
      this.collpsHeight = '0rem';
      // document.getElementById('descToggle').style.display = 'none';
      // document.getElementById('descToggleImg').style.display = 'none';
      // document.getElementById('quick').style.display = 'none';
      // document.getElementById('quick-func').style.display = 'none';

      document.getElementById('noteList').style.display = 'none';
      document.getElementById('agenda-desc').style.display = 'none';
      document.getElementById('agenda-att').style.display = 'none';
      this.noteTxt = "Add New Note";
    }
  }
  pauseTimer() {
    clearInterval(this.interval);
  }
  diffTimes(start, end) {
    // console.log('start end', start, end);
    if (start == undefined || end == undefined) {
      return '';
    } else {
      const firstDate = moment(start);
      const secondDate = moment(end);
      const diffInMins = Math.abs(firstDate.diff(secondDate, 'minutes'));
      console.log('difff', diffInMins);
      if (diffInMins <= 0) {
        return 'Less than a min';
      } else {
        return diffInMins + ' min';
      }
    }

  }
  startMeeting(Id) {
    if (this.meetingObject.AgendaItems.length == this.agendaInx + 1) {
      this.timer.status = 'Completed';
      this.stopObject.status = false;
      this.pauseTimer();
      // this.meetingObject.AgendaItems[this.agendaInx].Color = '#28a745';
      this.meetingObject.AgendaItems[this.agendaInx].EndTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en');
      this.progressColor = '';
    }
    if (this.meetingObject.AgendaItems.length > this.agendaInx + 1) {
      if (Id == 0) { this.agendaInx = 0; this.stopWatch(); }
      else {
        // this.meetingObject.AgendaItems[this.agendaInx].Color = '#28a745';
        this.meetingObject.AgendaItems[this.agendaInx].EndTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en');
        this.agendaInx += 1
      };
      this.timer.status = 'In Progress';
      // this.stopObject.status = true;
      this.progressColor = '';
      this.getNotes(this.agendaInx);
      this.startTimer(this.agendaInx);
      this.meetingObject.AgendaItems[this.agendaInx].StartTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en');
    }

  }
 
  startTimer(inx) {
    this.pauseTimer();
    const res = parseInt(this.meetingObject.AgendaItems[inx].Duration.slice(0, 2)) * 60;
    this.timeLeft = 0;
    console.log(res);
    this.colorInx = inx;
    this.interval = setInterval(() => {
      if (this.timeLeft < res) {
        this.timeLeft++;
        const val = (this.timeLeft / res) * 100
        this.meetingObject.AgendaItems[inx].Color = 'linear-gradient(to right,green ' + val + '%,lightgreen ' + val + '%)';
        // this.progressColor = 'linear-gradient(to right,green ' + val + '%,lightgreen ' + val + '%)';
      } else {
        // this.meetingObject.AgendaItems[inx].Color = '#28a745';
        this.startMeeting(1);
      }
    }, 1000)
  }
  stopObject: any = { hour: '00', minute: 0, second: 0, status: false };
  stopInterval;
  stopWatch() {
    const res = 60 * 60;
    this.stopInterval = setInterval(() => {
      // console.log('stopwatch', this.timeLeft, res);
      if (this.stopObject.second < res) {
        this.stopObject.second++;
        if (this.stopObject.second == 60) {
          this.stopObject.minute += 1;
          this.stopObject.second = 0;
        }
      }
    }, 1000);
  }
  ngOnDestroy() {
    clearInterval(this.stopInterval);
  }
  externalClose(){
    if(this.meetingObject.AgendaItems[0].AgendaName == "External Notes"){
      this.meetingObject.AgendaItems = [];
    }
  }
  getAllNotes() {
    if(this.meetingObject.AgendaItems.length > 0){
      this.meetingObject.AgendaItems.forEach(x => {
        x.Notes = [];
        this.shrService.getNotes(sessionStorage.getItem('groupId'), parseInt(x.AgendaID)).then(res => {
          console.log('get notes by agenda id', res);
          res.forEach(y => {
            const note = new Note();
            note.AgendaID = x.AgendaID;
            note.NoteID = y.fields.id;
            note.Description = y.fields.NoteDescription;
            note.Status = y.fields.NoteStatus;
            note.AssignedTo = y.fields.CustomAssignedTo;
            note.AssignedDate = y.fields.AssignedDate;
            note.DueDate = y.fields.CustomDueDate;
            note.Type = y.fields.Type;
            x.Notes.push(note);
          });
        });
      })
    }else{
      const agenda = new AgendaItems();
      agenda.AgendaName = "Meeting Summery";
      agenda.Notes = this.notesArray;
      this.meetingObject.AgendaItems.push(agenda);
    }
  
  }
  getBtnColor(type) {
    return 'warning';
  }
  changeAssignedTo(email) {
    this.noteDetail.AssignedTo = email;
  }

  sendMeetingNotes(val) {
    var attendees = [];
    val.forEach(x => {
      const obj = { emailAddress: { address: "" } };
      obj.emailAddress.address = x.Email;
      attendees.push(obj);
    });
    console.log('val', attendees);
    const sendMail = {
      message: {
        subject: "Meeting Notes",
        body: {
          contentType: "Html",
          content: (<HTMLDivElement>document.getElementById('sendNote')).innerHTML
        },
        toRecipients: attendees
      }
    };
    console.log('meeting notes', sendMail);
    (<HTMLDivElement>document.getElementById('alert')).style.display = 'block';
    this.graphService.sendMail(sendMail).then(res => {
      console.log('res', res);
    });
  }
  alertBtn() {
    (<HTMLDivElement>document.getElementById('alert')).style.display = 'none';
  }
  // attachments 
  imagesArray: any = [];
  Attachments1: any = [];
  isEditable: boolean = false;
  changeFileInput(response: any) {
    console.log('File Input response - ', response);
    if (response.target.files.length > 0) {
      for (let i = 0; i < response.target.files.length; i++) {
        var fileObject = new Attachments();
        var reader = new FileReader();
        reader.readAsDataURL(response.target.files[i]);
        reader.onload = (event: any) => { // called once readAsDataURL is completed
          const valobj: any = {};
          valobj.name = response.target.files[i].name;
          valobj.file = event.target.result;
          valobj.type = response.target.files[i].type.slice(0, 5);
          this.imagesArray.push(valobj);
        }
        fileObject.file = response.target.files[i];
        fileObject.AttachmentName = response.target.files[i].name;
        this.Attachments1.push(fileObject);
      }
    }
    console.log('aaaa', this.imagesArray);
  }
  // attachments end
}
