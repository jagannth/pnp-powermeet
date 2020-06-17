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

  constructor(public spinner: NgxSpinnerService, private proxy: ProxyService, private dataService: DataService, private graphService: GraphService, private router: Router, private fb: FormBuilder) {
    this.dashBoard = new Array<Dashboard>();
    this.Meeting = new Array<Meeting>();
    this.doughnutChartData = [
      [1, 3, 4, 0, 4, 2, 0],
      [4, 5, 4, 2, 3, 2, 4],
      [3, 2, 2, 1, 3, 2, 3],
      [4, 3, 4, 2, 4, 2, 5],
      [5, 5, 6, 0, 5, 2, 5],
      [2, 6, 7, 3, 5, 2, 6],
      [1, 2, 2, 5, 1, 2, 7],
    ];

    this.meetingDashboard = new MeetingDashboard();
    this.noteForm = this.fb.group({
      Description: '',
      Type: '',
      Status: '',
      AssignedTo: '',
      AssignedDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
      DueDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
    });
  }

  ngOnInit(): void {
    this.spinner.show();
    // sessionStorage.setItem('groupId', '120da134-9386-48f0-8aba-36fe0444a163');
    // this.postGroupPlan();
    // this.getGroupPlans();
    // this.postGroupTask();
    // this.getGroupTasks();
    this.getGraphUsers();
    this.note = new Note();
    this.username = sessionStorage.getItem('user');
    // this.getDashboard();
    // if (sessionStorage.getItem('groupId')) {
    //   this.getGroupUser(sessionStorage.getItem('groupId'));
    // }
    this.isGroup = sessionStorage.getItem('groupId');
    console.log('group id', this.isGroup);
    setTimeout(() => {
      if (this.isGroup) this.getMeetingsDashboard('group', this.isGroup);
      else this.getMeetingsDashboard(this.username, 0);
    }, 100);
  }
  isGroup: string;
  getMeetingsDashboard(Id, groupId) {
    this.proxy.Get('meetings/dashboard/' + Id + '/' + groupId).subscribe(res => {
      this.Meeting = res.Data.Meetings;
      console.log('meetings', this.Meeting);
      for (let i = 0; i < this.Meeting.length; i++) {
        if (this.Meeting[i].MeetingName != 'External Items') {
          if (this.Meeting[i].AgendaItems.length == 0) {
            this.Meeting.splice(i, 1);
          }
        }
      }

      // var array = [];
      // this.Meeting.forEach((x, index) => {
      //   if (x.MeetingName != 'External Items') {
      //     if (x.AgendaItems.length == 0) {
      //       array.push(x.MeetingName);
      //       // this.Meeting.splice(index,1);
      //       // return;
      //     } else {
      //       x.AgendaItems.forEach(y => {
      //         if (y.Notes.length == 0) {
      //           // this.Meeting.splice(index,1);
      //           array.push(x.MeetingName);
      //           // return;
      //         }
      //       });
      //     }
      //   }
      // });
      // console.log('array', array);
      // array.forEach(x => {
      //   this.Meeting.splice(this.Meeting.findIndex(y => y.MeetingName == x), 1);
      // });
      sessionStorage.setItem('orgMeeting', JSON.stringify(this.Meeting));
      this.Meeting = this.usermeet();
      this.spinner.hide();
      setTimeout(() => {
        this.donaughtChart('u');
      }, 2000);
    });

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
      });
    } else {
      this.note = val;
      this.noteForm.patchValue({
        Description: this.note.Description,
        Type: this.note.Type,
        Status: this.note.Status,
        AssignedTo: this.note.AssignedTo,
        AssignedDate: formatDate(this.note.AssignedDate, 'yyyy-MM-dd', 'en'),
        DueDate: formatDate(this.note.DueDate, 'yyyy-MM-dd', 'en')
      })
    }
  }
  saveChanges() {
    this.note.Description = this.noteForm.value.Description;
    this.note.Type = this.noteForm.value.Type;
    this.note.Status = this.noteForm.value.Status;
    this.note.AssignedDate = this.noteForm.value.AssignedDate;
    this.note.DueDate = this.noteForm.value.DueDate;
    this.note.GroupID = sessionStorage.getItem('groupId');;
    this.note.AssignedTo = this.noteForm.value.AssignedTo;
    this.note.NoteAudit.UpdatedCount += 1;
    this.note.NoteAudit.LastUpdatedDate = new Date();
    this.note.NoteAudit.LastUpdatedBy = this.username;
    this.spinner.show();
    console.log(';this.note', this.note);
    this.proxy.Post('meetings/notes', this.note).subscribe(res => {
      console.log('post note res', res);
      this.note = new Note();
      if (this.isGroup) this.getMeetingsDashboard('group', this.isGroup);
      else this.getMeetingsDashboard(this.username, 0);
    });
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
    // this.doughnutChartData = [
    //   [risk, 0, 0, 0, 0, 0, 0, total1 - risk],
    //   [0, 0, decision, 0, 0, 0, 0, total1 - decision],
    //   [0, action, 0, 0, 0, 0, 0, total1 - action],
    //   [0, 0, 0, planned, 0, 0, 0, total2 - planned],
    //   [0, 0, 0, 0, inpro, 0, 0, total2 - inpro],
    //   [0, 0, 0, 0, 0, close, 0, total2 - close],
    //   [0, 0, 0, 0, 0, 0, completed, total2 - completed],
    // ];
    this.doughnutChartData = [
      [1, 3, 4, 0, 4, 2, 0],
      [4, 5, 4, 2, 3, 2, 4],
      [3, 2, 2, 1, 3, 2, 3],
      [4, 3, 4, 2, 4, 2, 5],
      [5, 5, 6, 0, 5, 2, 5],
      [2, 6, 7, 3, 5, 2, 6],
      [1, 2, 2, 5, 1, 2, 7],
    ];
  }
  test: string = "working fine";
  searchData(event) {
    this.Meeting.forEach((x, index) => {
      (<HTMLDivElement>document.getElementById('collapseOne_' + index)).classList.add('show');
    })
  }
}
