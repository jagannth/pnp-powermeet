import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProxyService } from 'src/app/services/proxy.service';
import { Dashboard, MeetingDashboard } from 'src/app/models/Dashboard';
import { User } from 'src/app/models/User';
import { DataService } from 'src/app/services/data.service';
import { Note } from 'src/app/models/Note';
import { GraphService } from 'src/app/services/graph.service';
import { NoteAudit } from 'src/app/models/NoteAudit';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Meeting } from 'src/app/models/Meeting';

import { ChartType } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';
import { SharePointDataServicesService } from 'src/app/services/share-point-data-services.service';
import { AgendaItems } from 'src/app/models/AgendaItem';
declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashBoard: Array<Dashboard>;
  Meeting: Array<Meeting> = [];
  UserMeeting: Array<Meeting> = [];
  meetingDashboard: MeetingDashboard;
  myNotes: any = [];
  note: Note;
  IsOwner: boolean = false;
  username: string;
  noteForm: FormGroup;
  Toggle: string = 'Show';
  heading: string = 'My Items';
  toggleAccordian: boolean = false;
  tgAdmin: boolean = false;
  public search: any = '';
  imgUrl: string = "../../../assets/images/Send-Icon.svg";
  colorsArray: any = ['lightgray', 'darkcyan', 'crimson', 'chocolate', 'darkgoldenrod', 'blue', 'purple', 'brown', 'chartreuse'];


  // Doughnut
  public doughnutChartLabels: Label[] = ['Risk', 'Decision', 'Action', 'Planned', 'In Progress', 'Completed', ''];
  public doughnutChartData: MultiDataSet = [];
  public doughnutChartType: ChartType = 'doughnut';

  constructor(public spinner: NgxSpinnerService, private shrService: SharePointDataServicesService, private proxy: ProxyService, private dataService: DataService, private graphService: GraphService, private router: Router, private fb: FormBuilder) {
    this.dashBoard = new Array<Dashboard>();
    this.Meeting = new Array<Meeting>();
    this.doughnutChartData = [
      [1, 1, 2, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 2, 0],
    ];

    this.meetingDashboard = new MeetingDashboard();
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
  ngOnInit(): void {
    // this.getGraphUsers();
    // this.note = new Note();
    // this.username = sessionStorage.getItem('user');
    // this.isGroup = sessionStorage.getItem('groupId');
    // console.log('group id', this.isGroup);
    // setTimeout(() => {
    //   if (this.isGroup) this.getMeetingsDashboard('group', this.isGroup);
    //   else this.getMeetingsDashboard(this.username, 0);
    // }, 100);
  }
  changeFileInput(response) {
    const file = response.target.files[0];
    this.shrService.UploadAttachments(sessionStorage.getItem('groupId'), file, file.name, 1, 1).then(res => {
      console.log('file upload response', res);
    })
  }
  clear() {
    this.dashBoard = new Array<Dashboard>();
    this.Meeting = new Array<Meeting>();
    this.doughnutChartData = [
      [1, 1, 2, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 2, 0],
    ];

    this.meetingDashboard = new MeetingDashboard();
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
  isGroup: string;
  getMeetingsDashboard(Id, groupId) {
    this.spinner.show();
    this.shrService.getMeetings(sessionStorage.getItem('groupId')).then((res) => {
      console.log('meetings response', res);
      res.forEach(x => {
        const meeting = new Meeting();
        meeting.MeetingID = x.fields.id;
        meeting.MeetingName = x.fields.Title;
        meeting.MeetingDescription = x.fields.MeetingDescription;
        meeting.StartDate = x.fields.StartDateTime;
        this.shrService.getAgendaItems(sessionStorage.getItem('groupId'), parseInt(meeting.MeetingID)).then(res => {
          console.log('agenda items res', res);
          res.forEach(y => {
            const agenda = new AgendaItems();
            agenda.AgendaName = y.fields.Title;
            agenda.AgendaDescription = y.fields.AgendaDescription;
            agenda.Duration = y.fields.AgendaDuration;
            agenda.StartTime = y.fields.EndDateTime;
            agenda.EndTime = y.fields.StartDateTime;
            agenda.AgendaID = y.fields.id;
            agenda.MeetingID = y.fields.MeetingLookupId;
            agenda.Status = y.fields.AgendaItemStatus;
            agenda.IsApproved = y.fields.IsApproved;
            this.shrService.getNotes(sessionStorage.getItem('groupId'), parseInt(agenda.AgendaID)).then(res => {
              console.log('get notes by agenda id', res);
              res.forEach(z => {
                const note = new Note();
                note.AgendaID = agenda.AgendaID;
                note.NoteID = z.fields.id;
                note.Description = z.fields.NoteDescription;
                note.Status = z.fields.NoteStatus;
                note.Type = z.fields.Type;
                note.AssignedTo = z.fields.CustomAssignedTo;
                note.AssignedDate = z.fields.AssignedDate;
                note.DueDate = z.fields.CustomDueDate;
                agenda.Notes.push(note);
              });
            });
            meeting.AgendaItems.push(agenda);
          });
        });
        this.Meeting.push(meeting);
      });
      const met = new Meeting();
      met.MeetingName = "External";
      met.AgendaItems.push(new AgendaItems());
      this.shrService.getExternalNotes(sessionStorage.getItem('groupId')).then(res => {
        console.log('external notes', res);
        res.forEach(z => {
          if (z.fields.Title == "External") {
            const note = new Note();
            note.NoteID = z.fields.id;
            note.Description = z.fields.NoteDescription;
            note.Status = z.fields.NoteStatus;
            note.Type = z.fields.Type;
            note.AssignedTo = z.fields.CustomAssignedTo;
            note.AssignedDate = z.fields.AssignedDate;
            note.DueDate = z.fields.CustomDueDate;
            met.AgendaItems[0].Notes.push(note);
          }

        });
      })
      this.Meeting.push(met);
      setTimeout(() => {
        sessionStorage.setItem('orgMeeting', JSON.stringify(this.Meeting));
        this.Meeting = this.usermeet();
        this.spinner.hide();
        setTimeout(() => {
          this.donaughtChart('u');
        }, 2000);
      }, 4000);
    });
    this.spinner.hide();

  }
  usermeet() {
    this.Meeting.forEach(x => {
      x.AgendaItems.forEach(y => {
        let len = 0;
        if (status) {
          y.Notes = y.Notes.filter(z => z.AssignedTo == this.username);
        }
        else {
          y.Notes = y.Notes.filter(z => z.AssignedTo == this.username);
        }
      });
    });
    return this.Meeting;
  }
  dashBoardCount(admin, status, value) {
    var count = 0;
    if (admin == 0) {
      this.Meeting.forEach(x => {
        x.AgendaItems.forEach(y => {
          let len = 0;
          if (status) {
            len = y.Notes.filter(z => z.Status == value && z.AssignedTo == this.username).length;
          }
          else {
            len = y.Notes.filter(z => z.Type == value && z.AssignedTo == this.username).length;
          }
          count += len;
        });
      });
    }
    else {
      this.Meeting.forEach(x => {
        x.AgendaItems.forEach(y => {
          let len = 0;
          if (status) {
            len = y.Notes.filter(z => z.Status == value).length;
          }
          else {
            len = y.Notes.filter(z => z.Type == value).length;
          }
          count += len;
        });
      });
    }
    return count;
  }
  getGroupUser(Id) {
    this.graphService.getGroupUsers(Id).then(res => {
      console.log('group users', res);
      const val = res.filter(x => x.userPrincipalName == this.username);
      if (val.length > 0)
        this.IsOwner = true;
    });
  }
  getTaskByMeeting(meetingId) {
    console.log('meeting id', meetingId);
    if (meetingId != '') {
      // $("#collapseExample").collapse('show');
      this.Toggle = 'Hide';
      if (meetingId == 'All') {
        this.heading = 'All Items';
        this.myNotes = this.dashBoard;
      }
      else if (meetingId == 'My') {
        this.heading = 'My Items';
        this.myNotes = this.dashBoard.filter(x => x.Note.AssignedTo == this.username);
      }
      else {
        this.proxy.Get('meetings/dashboard/' + sessionStorage.getItem('groupId') + '/' + meetingId).subscribe(res => {
          console.log('meeting dashboard', res.Data);
          this.myNotes = res.Data.Dashboard;
        });
      }
    }
  }
  getDashboard() {
    this.proxy.Get('meetings/dashboard/' + sessionStorage.getItem('groupId') + '/0').subscribe(res => {
      console.log('dashboard', res.Data);
      this.dashBoard = res.Data.Dashboard;
      this.Meeting = res.Data.Meeting;
      this.meetingDashboard.Meeting = this.Meeting.length;
      this.meetingDashboard.Action = this.dashBoard.filter(x => x.Note.Type == 'Action').length;
      this.meetingDashboard.Risk = this.dashBoard.filter(x => x.Note.Type == 'Risk').length;
      this.meetingDashboard.Decision = this.dashBoard.filter(x => x.Note.Type == 'Decision').length;
      this.meetingDashboard.Planned = this.dashBoard.filter(x => x.Note.Status == 'Planned').length;
      this.meetingDashboard.InProgress = this.dashBoard.filter(x => x.Note.Status == 'In Progress').length;
      this.meetingDashboard.Completed = this.dashBoard.filter(x => x.Note.Status == 'Completed').length;
      this.meetingDashboard.CloseToDeliver = this.dashBoard.filter(x => x.Note.Status != 'Completed' && formatDate(x.Note.CreatedDate, 'yyyy/MM/dd', 'en') >= formatDate(new Date().setDate(new Date().getDate() - 1), 'yyyy/MM/dd', 'en')).length;

      this.meetingDashboard.MyAction = this.dashBoard.filter(x => x.Note.Type == 'Action' && x.Note.AssignedTo == this.username).length;
      this.meetingDashboard.MyRisk = this.dashBoard.filter(x => x.Note.Type == 'Risk' && x.Note.AssignedTo == this.username).length;
      this.meetingDashboard.MyDecision = this.dashBoard.filter(x => x.Note.Type == 'Decision' && x.Note.AssignedTo == this.username).length;
      this.meetingDashboard.MyPlanned = this.dashBoard.filter(x => x.Note.Status == 'Planned' && x.Note.AssignedTo == this.username).length;
      this.meetingDashboard.MyInProgress = this.dashBoard.filter(x => x.Note.Status == 'In Progress' && x.Note.AssignedTo == this.username).length;
      this.meetingDashboard.MyCompleted = this.dashBoard.filter(x => x.Note.Status == 'Completed' && x.Note.AssignedTo == this.username).length;
      this.meetingDashboard.MyCloseToDeliver = this.dashBoard.filter(x => x.Note.Status != 'Completed' && x.Note.AssignedTo == this.username && formatDate(x.Note.CreatedDate, 'yyyy/MM/dd', 'en') >= formatDate(new Date().setDate(new Date().getDate() - 1), 'yyyy/MM/dd', 'en')).length;
      this.myNotes = this.dashBoard.filter(x => x.Note.AssignedTo == this.username);
      console.log('meeting dassdsfdsd', this.meetingDashboard);
      console.log('date1', this.dashBoard[0].Note.CreatedDate);
      console.log('date2', formatDate(this.dashBoard[0].Note.CreatedDate, 'yyyy/MM/dd', 'en'));
      console.log('date1', formatDate(new Date().setDate(new Date().getDate() - 1), 'yyyy/MM/dd', 'en'));
    });
  }
  filter(admin, status, value) {
    this.toggleAccordian = false;
    $("#collapseExample").collapse('show');
    this.Toggle = 'Hide';
    if (admin == 0) {
      this.heading = 'My ' + value + ' Items';
      if (status) {
        this.myNotes = this.dashBoard.filter(x => x.Note.Status == value && x.Note.AssignedTo == this.username);
      } else {
        this.myNotes = this.dashBoard.filter(x => x.Note.Type == value && x.Note.AssignedTo == this.username);
      }
    } else {
      this.heading = 'All Meetings ' + value + ' Items';
      if (status) {
        this.myNotes = this.dashBoard.filter(x => x.Note.Status == value);
      } else {
        this.myNotes = this.dashBoard.filter(x => x.Note.Type == value);
      }
    }

  }
  usersList: Array<User>;
  getUsersList() {
    this.dataService.data.subscribe(res => {
      this.usersList = res;
      console.log('users list', this.usersList);
    });
  }
  getStatus(email): User {
    const data = this.usersList.find(x => x.email === email);
    return data;
  }
  toggleBtn() {
    if (this.Toggle === 'Show') {
      this.Toggle = 'Hide';
    }
    else {
      this.Toggle = 'Show';
      this.heading = '';
    }
  }
  editNote(val, Id) {
    console.log('open pop-up');
    if (Id == 0) {
      this.note = new Note();
      this.note.NoteAudit = new NoteAudit();
      this.noteForm.patchValue({
        Description: '',
        Type: '',
        Status: '',
        AssignedTo: '',
        AssignedDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
        DueDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
        NoteID: ''
      });
    } else {
      this.note = val;
      this.noteForm.patchValue({
        Description: this.note.Description,
        Type: this.note.Type,
        Status: this.note.Status,
        AssignedTo: this.note.AssignedTo,
        AssignedDate: formatDate(this.note.AssignedDate, 'yyyy-MM-dd', 'en'),
        DueDate: formatDate(this.note.DueDate, 'yyyy-MM-dd', 'en'),
        NoteID: this.note.NoteID
      })
    }
  }
  saveChanges() {
    console.log('id', this.noteForm.value.NoteID);
    const inx = this.Meeting.findIndex(x => x.MeetingName == "External");
    if (this.noteForm.value.NoteID == '') {
      const listItem = {
        "fields": {
          "Title": "External",
          "NoteDescription": this.noteForm.value.Description,
          "Type": this.noteForm.value.Type,
          "AssignedDate": this.noteForm.value.AssignedDate,
          "NoteStatus": this.noteForm.value.Status,
          "CustomDueDate": this.noteForm.value.DueDate,
          "CustomAssignedTo": this.noteForm.value.AssignedTo
        }
      };
      this.shrService.postNote(sessionStorage.getItem('groupId'), listItem).then(res => {
        console.log('post notes response', res);
        this.clear();
        this.getMeetingsDashboard('group', this.isGroup);
      });
    } else {
      const listItem = {
        "fields": {
          "NoteDescription": this.noteForm.value.Description,
          "Type": this.noteForm.value.Type,
          "AssignedDate": this.noteForm.value.AssignedDate,
          "NoteStatus": this.noteForm.value.Status,
          "CustomDueDate": this.noteForm.value.DueDate,
          "CustomAssignedTo": this.noteForm.value.AssignedTo
        }
      };
      this.shrService.putNote(sessionStorage.getItem('groupId'), listItem, this.noteForm.value.NoteID).then(res => {
        console.log('post notes response', res);
        this.clear();
        this.getMeetingsDashboard('group', this.isGroup);
      });
    }

  }
  toggle: number = 0;
  btnToggle: string = 'outline-primary'
  showAll() {
    if (this.toggle % 2 == 0) {
      this.btnToggle = 'primary';
      this.myNotes = this.dashBoard;
    }
    else {
      this.btnToggle = 'outline-primary';
      this.myNotes = this.dashBoard.filter(x => x.Note.AssignedTo == this.username);
    }
    this.toggle += 1;
  }
  getGraphUsers() {
    this.graphService.getUsers().then((res) => {
      console.log('users list response ', res);
      const users = new Array<User>();
      res.forEach(x => {
        const user = new User();
        user.id = x.id;
        user.email = x.userPrincipalName;
        user.displayName = x.givenName.slice(0, 1) + x.surname.slice(0, 1);
        this.graphService.getUserProfile(x.userPrincipalName).then((res) => {
          if (res) {
            let reader = new FileReader();
            reader.addEventListener("load", () => {
              user.file = reader.result;
              user.status = true;
            }, false);
            if (res) {
              reader.readAsDataURL(res);
            }
          }
        }).catch(error => {
          console.log('error', error);
          user.status = false;
        });
        users.push(user);
      });
      this.dataService.updatedDataSelection(users);
      this.getUsersList();
    });
  }
  changeAssignedTo(val) {
    this.noteForm.patchValue({
      AssignedTo: val
    });
    console.log('testtt', this.noteForm);
  }
  postGroupPlan() {
    const plannerPlan = {
      owner: "3527aff3-62df-4cbb-8830-01784a1f6940",
      title: "title-value"
    };
    this.graphService.postGroupPlan(plannerPlan).then(res => {
      console.log('group plan post', res);
    })
  }
  getGroupPlans() {
    this.graphService.getGroupPlans().then(res => {
      console.log('group plan get', res);
    })
  }
  postGroupTask() {
    const plannerTask = {
      planId: "EKWgHXzX-UCJt7iRNg9AJ8kAFk5v",
      bucketId: "AOvw-qpv4k-AzHf5N9txNMkAFwCR",
      title: "Update client list",
    }
    this.graphService.postGroupTask(plannerTask).then(res => {
      console.log('group plan task post', res);
    })
  }
  getGroupTasks() {
    this.graphService.getGroupTasks('EKWgHXzX-UCJt7iRNg9AJ8kAFk5v').then(res => {
      console.log('group plan get tasks', res);
    });
  }
  toggleAc() {
    this.toggleAccordian = true;
    this.heading = 'Tasks By Meeting';
    this.getTaskByMeeting(this.Meeting[0].MeetingID);
    setTimeout(() => {
      (<HTMLButtonElement>document.getElementById('my_0')).classList.remove('collapsed');
      (<HTMLDivElement>document.getElementById('collapseOne_0')).classList.add('show');
    }, 100);
  }
  toggleAdmin(value) {
    this.tgAdmin = value;
    this.search = '';
    if (value == true) {
      this.heading = 'All Items';
      this.Meeting = JSON.parse(sessionStorage.getItem('orgMeeting'));
      setTimeout(() => {
        this.donaughtChart('a');
      }, 1000);
    } else {
      this.heading = 'My Items';
      this.Meeting = this.usermeet();
      setTimeout(() => {
        this.donaughtChart('u');
      }, 1000);
    }
  }
  donaughtChart(id) {
    const risk = parseInt(document.getElementById('risk-' + id).innerText);
    const action = parseInt(document.getElementById('decision-' + id).innerText);
    const decision = parseInt(document.getElementById('action-' + id).innerText);
    const planned = parseInt(document.getElementById('planned-' + id).innerText);
    const inpro = parseInt(document.getElementById('in-' + id).innerText);
    const close = parseInt(document.getElementById('close-' + id).innerText);
    const completed = parseInt(document.getElementById('completed-' + id).innerText);
    const total1 = risk + action + decision;
    const total2 = planned + inpro + close + completed;
    // [risk, action, decision, 0, 0, 0, 0, total1 - risk],
    this.doughnutChartData = [
      [risk, action, decision, 0, 0, 0, 0, 0],
      [0, 0, 0, planned, inpro, completed, 0, 0]
    ];
  }
  test: string = "working fine";
  searchData(event) {
    this.Meeting.forEach((x, index) => {
      (<HTMLDivElement>document.getElementById('collapseOne_' + index)).classList.add('show');
    })
  }
}
