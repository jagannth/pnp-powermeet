import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProxyService } from 'src/app/services/proxy.service';
import { Dashboard, DashboardCounts } from 'src/app/models/Dashboard';
import { User } from 'src/app/models/User';
import { DataService } from 'src/app/services/data.service';
import { Note } from 'src/app/models/Note';
import { GraphService } from 'src/app/services/graph.service';
import { NoteAudit } from 'src/app/models/NoteAudit';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Meeting, DashboardMeeting } from 'src/app/models/Meeting';

import { ChartType, PointStyle } from 'chart.js';
import { MultiDataSet, Label, Colors } from 'ng2-charts';
import { SharePointDataServicesService } from 'src/app/services/share-point-data-services.service';
import { AgendaItems } from 'src/app/models/AgendaItem';
import * as Chart from 'chart.js';
declare var $: any;
Chart.defaults.global.legend.labels.usePointStyle = true;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashBoard: Array<Dashboard>;
  Meeting: Array<DashboardMeeting> = [];
  UserMeeting: Array<Meeting> = [];
  dashboardCounts: DashboardCounts;
  myNotes: any = [];
  note: Note;
  IsOwner: boolean = false;
  username: string;
  noteForm: FormGroup;
  Toggle: string = 'Show';
  heading: string = 'My Items';
  toggleAccordian: boolean = false;
  tgAdmin: boolean = false;
  oldcolor: string = "toid";
  logo: string = 'https://powermeetblobs.blob.core.windows.net/powermeet-blob/logo.jpg';
  public search: any = '';
  imgUrl: string = "../../../assets/images/Send-Icon.svg";
  colorsArray: any = ['lightgray', 'darkcyan', 'crimson', 'chocolate', 'darkgoldenrod', 'blue', 'purple', 'brown', 'chartreuse'];
  public chartColors: Array<any> = [
    { // all colors in order
      backgroundColor: ['#e65124', '#ec7f22', '#006a9e', '#7d7d7d', '#c5c5c5', '#f4f3f3']
    }
  ];
  public chartColors1: Array<any> = [
    { // all colors in order
      backgroundColor: ['#e65124', '#ec7f22', '#006a9e', '#7d7d7d', '#c5c5c5', '#f4f3f3']
    }
  ];

  // Doughnut
  public doughnutChartLabels: Label[] = ['Risk', 'Action', 'Decision', 'Planned', 'In Progress', 'Completed'];
  public doughnutChartData: MultiDataSet = [];
  public doughnutChartType: ChartType = 'doughnut';


  constructor(public spinner: NgxSpinnerService, private shrService: SharePointDataServicesService, private proxy: ProxyService, private dataService: DataService, private graphService: GraphService, private router: Router, private fb: FormBuilder, public route: ActivatedRoute) {
    this.dashBoard = new Array<Dashboard>();
    this.Meeting = new Array<DashboardMeeting>();
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
  currentUrl: string = window.location.href;
  isGroup: string;
  meetingId: string = '';
  public lineChartLegend: boolean = false;
  ngOnInit(): void {
    this.spinner.show();
    this.utilities();
    this.getUsersList();
    this.getGroupTasks();
    setTimeout(() => {
      if (this.meetingId != '' && this.meetingId != null) {
        (<HTMLAnchorElement>document.getElementById('notesscreen')).click();
      }
      this.spinner.hide();
    }, 5000);
    setTimeout(() => { this.meetingId = sessionStorage.getItem('subEntityId'); }, 3000);
  }
  utilities() {
    this.note = new Note();
    this.username = sessionStorage.getItem('user');
    this.isGroup = sessionStorage.getItem('groupId');
    document.getElementById('todayactive').classList.remove('active');
    if (sessionStorage.getItem('groupId') == 'undefined')
      this.getMeetingsDashboard('0');
    else
      this.getMeetingsDashboard(this.isGroup);
  }
  clear() {
    this.dashBoard = new Array<Dashboard>();
    this.Meeting = new Array<DashboardMeeting>();
    this.dashboardCounts = new DashboardCounts();
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
  async getMeetingsDashboard(groupId): Promise<any> {
    await this.shrService.getMeetings(sessionStorage.getItem('groupId')).then(async res => {
      let resObj: any = [];
      if (groupId == '0') {
        resObj = res.filter(x => x.fields.IsGroup == false && x.fields.Organizer == sessionStorage.getItem('user'));
      } else {
        resObj = res.filter(x => x.fields.IsGroup == true);
      }
      await resObj.map(x => {
        const meeting = new DashboardMeeting();
        meeting.MeetingID = x.fields.id;
        meeting.MeetingName = x.fields.Title;
        meeting.MeetingDescription = x.fields.MeetingDescription;
        meeting.StartDate = x.fields.StartDateTime;
        meeting.IsRecurring = x.fields.IsRecurring;
        this.shrService.getMeetingNotes(parseInt(meeting.MeetingID)).then(res => {
          res.map(y => {
            console.log('get notes by meeting id', res);
            const note = new Note();
            note.NoteID = y.fields.id;
            note.AgendaID = y.fields.AgendaLookupId;
            note.Description = y.fields.NoteDescription;
            note.Status = y.fields.NoteStatus;
            note.Type = y.fields.Type;
            note.AssignedTo = y.fields.CustomAssignedTo;
            note.AssignedDate = y.fields.AssignedDate;
            note.DueDate = y.fields.CustomDueDate;
            meeting.Notes.push(note);
          });
        });
        this.Meeting.push(meeting);
      });
      //   const met = new DashboardMeeting();
      //   met.MeetingName = "External";
      //   met.StartDate = new Date().toString();
      //  await this.shrService.getExternalNotes(sessionStorage.getItem('groupId')).then(res => {
      //     console.log('external notes', res);
      //     res.forEach(z => {
      //       if (z.fields.Title == "External") {
      //         const note = new Note();
      //         note.NoteID = z.fields.id;
      //         note.Description = z.fields.NoteDescription;
      //         note.Status = z.fields.NoteStatus;
      //         note.Type = z.fields.Type;
      //         note.AssignedTo = z.fields.CustomAssignedTo;
      //         note.AssignedDate = z.fields.AssignedDate;
      //         note.DueDate = z.fields.CustomDueDate;
      //         met.Notes.push(note);
      //       }

      //     });
      //   })
      //   this.Meeting.push(met);
      // this.Meeting = responseObject;

    }).then(() => {
      setTimeout(() => {
        console.log('meetings response', this.Meeting);
        this.MeetingCount = this.Meeting.length;
        this.Meeting = this.Meeting.filter(x => x.Notes.length > 0);
        console.log('best value', this.Meeting.filter(x => x.Notes.length > 0));
        sessionStorage.setItem('orgMeeting', JSON.stringify(this.Meeting));
        this.filters('Day', 'toid');
        this.getDashboard();
      }, 5000);
    });
  }
  MeetingCount: number;
  overviewDate: string = formatDate(new Date(), 'dd/MM/yyyy', 'en');
  fillDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  filteredData: any;
 
  usermeet() {
    this.filteredData.forEach(x => {
      x.Notes = x.Notes.filter(z => z.AssignedTo == this.username);
    });
    return this.filteredData;
  }
  dashBoardCount1(admin, status, value) {
    var count = 0;
    if (admin == 0) {
      this.Meeting.forEach(x => {
        let len = 0;
        if (status) {
          len = x.Notes.filter(z => z.Status == value && z.AssignedTo == this.username).length;
        }
        else {
          len = x.Notes.filter(z => z.Type == value && z.AssignedTo == this.username).length;
        }
        count += len;
      });
    }
    else {
      this.Meeting.forEach(x => {
        let len = 0;
        if (status) {
          len = x.Notes.filter(z => z.Status == value).length;
        }
        else {
          len = x.Notes.filter(z => z.Type == value).length;
        }
        count += len;
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
  filterdata(val) {
    this.Meeting = JSON.parse(sessionStorage.getItem('orgMeeting'));
    console.log('Hey this is filter', val);
    if (val == "Risk" || val == "Action" || val == "Decision") {
      this.Meeting = this.Meeting.filter(x => {
        let d = x.Notes.filter(z => z.Type === val && z.AssignedTo === this.username)
        if (d.length > 0)
          return d;
      })
    }
    console.log("Meetings", this.username);
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
        this.getMeetingsDashboard(this.isGroup);
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
        this.getMeetingsDashboard(this.isGroup);
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
  changeAssignedTo(val) {
    this.noteForm.patchValue({
      AssignedTo: val
    });
    console.log('testtt', this.noteForm);
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
  Changecolor(val) {
    //console.log('')
    $('.tiles1').removeClass('active');
    $('.tiles1').addClass('inactive');
    $('.tiles').removeClass('active');
    $('.tiles').addClass('inactive');
    $('#' + val).removeClass('inactive');
    $('#' + val).addClass('active');
  }
  test: string = "working fine";
  searchData(event) {
    this.Meeting.forEach((x, index) => {
      (<HTMLDivElement>document.getElementById('collapseOne_' + index)).classList.add('show');
    })
  }
  getDashboard() {
    this.dashboardCounts = new DashboardCounts();
    this.Meeting.forEach(z => {
      this.dashboardCounts.Meeting = this.MeetingCount;
      this.dashboardCounts.Action += z.Notes.filter(x => x.Type == 'Action').length;
      this.dashboardCounts.Risk += z.Notes.filter(x => x.Type == 'Risk').length;
      this.dashboardCounts.Decision += z.Notes.filter(x => x.Type == 'Decision').length;
      this.dashboardCounts.Planned += z.Notes.filter(x => x.Status == 'Planned').length;
      this.dashboardCounts.InProgress += z.Notes.filter(x => x.Status == 'In Progress').length;
      this.dashboardCounts.Completed += z.Notes.filter(x => x.Status == 'Completed').length;
      this.doughnutChartData = [
        [this.dashboardCounts.Risk, this.dashboardCounts.Action, this.dashboardCounts.Decision, 0, 0, 0],
        [0, 0, 0, this.dashboardCounts.Planned, this.dashboardCounts.InProgress, this.dashboardCounts.Completed]
      ];
    });
    console.log('dashbaord1', this.dashboardCounts);
    if (this.dashboardCounts.Risk + this.dashboardCounts.Action + this.dashboardCounts.Decision > 0) {
      this.lineChartLegend = true;
    }
  }
  userProfile(id) {
    $('.tooltip-inner').css('background-color', '#fff');
    $('.tooltip-inner').css('color', 'black');
    $('#'+id).tooltip({
      placement: 'right',
      html: true
    });
  }
  dayValue: string = 'Day';
  filters(val: string, id) {
    this.dayValue = val;
    if (this.oldcolor != "") {
      $("#" + this.oldcolor).removeClass('active');
      $("#toid").removeClass('active');
    }
    $("#" + id).addClass('active');
    this.oldcolor = id;
    this.filteredData = JSON.parse(sessionStorage.getItem('orgMeeting'));
    if (!this.tgAdmin) {
      this.filteredData = this.usermeet();
    }
    if (val == 'Day') {
      this.heading = 'Today Meeting Items';
      this.overviewDate = formatDate(new Date(), 'dd/MM/yyyy', 'en');
      this.Meeting = this.filteredData.filter(x => (formatDate(x.StartDate, 'yyyy/MM/dd', 'en') == formatDate(new Date(), 'yyyy/MM/dd', 'en')) );
      this.Meeting.forEach(z=>{
        z.Notes = z.Notes.filter(x => (formatDate(x.CreatedDate, 'yyyy/MM/dd', 'en') == formatDate(new Date(), 'yyyy/MM/dd', 'en')) );
      });
    }
    else if (val == 'Week') {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      this.overviewDate = formatDate(date, 'dd/MM/yyyy', 'en') + ' - ' + formatDate(new Date(), 'dd/MM/yyyy', 'en');
      this.heading = 'This Week Meeting Items';
      this.Meeting = this.filteredData.filter(x => formatDate(x.StartDate, 'yyyy/MM/dd', 'en') >= formatDate(date, 'yyyy/MM/dd', 'en') );
      this.Meeting.forEach(z=>{
        z.Notes = z.Notes.filter(x => (formatDate(x.CreatedDate, 'yyyy/MM/dd', 'en')  >= formatDate(date, 'yyyy/MM/dd', 'en')));
      });
    } else if (val == 'Month') {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      this.overviewDate = formatDate(date, 'dd/MM/yyyy', 'en') + ' - ' + formatDate(new Date(), 'dd/MM/yyyy', 'en');
      this.heading = 'This Month Meeting Items';
      this.Meeting = this.filteredData.filter(x => formatDate(x.StartDate, 'yyyy/MM/dd', 'en') >= formatDate(date, 'yyyy/MM/dd', 'en') );
      this.Meeting.forEach(z=>{
        z.Notes = z.Notes.filter(x => (formatDate(x.CreatedDate, 'yyyy/MM/dd', 'en')  >= formatDate(date, 'yyyy/MM/dd', 'en')));
      });
    } else {
      console.log('date', val);
      this.overviewDate = formatDate(val, 'dd/MM/yyyy', 'en');
      this.heading = formatDate(val, 'dd/MM/yyyy', 'en') + ' Meeting Items';
      this.Meeting = this.filteredData.filter(x => formatDate(x.StartDate, 'yyyy/MM/dd', 'en') == formatDate(val, 'yyyy/MM/dd', 'en'));
      this.Meeting.forEach(z=>{
        z.Notes = z.Notes.filter(x => (formatDate(x.CreatedDate, 'yyyy/MM/dd', 'en')  == formatDate(val, 'yyyy/MM/dd', 'en')));
      });
    }
    console.log('filter data', this.filteredData);
    console.log('meeting data', this.Meeting);
    this.getDashboard();
  }
  toggleAdmin(id, value) {
    this.tgAdmin = value;
    if (id === "All") {
      (<HTMLElement>document.getElementById("All")).classList.add('active');
      (<HTMLElement>document.getElementById("my")).classList.remove('active');
    }
    else if (id === "my") {
      (<HTMLElement>document.getElementById("my")).classList.add('active');
      (<HTMLElement>document.getElementById("All")).classList.remove('active');
    }

    this.search = '';
    this.filters(this.dayValue, this.oldcolor);
    this.getDashboard();
    if (value == true) {
      this.heading = 'All Items';
      // this.Meeting = this.filteredData;
      // this.getDashboard();
    } else {
      this.heading = 'My Items';
      // this.Meeting = this.usermeet();
      // this.getDashboard();
    }
  }
  tabFilter(type: string, status: string) {
    console.log('filteedd ', this.filteredData);
    console.log('meetinggg ', this.Meeting);
    if (status == 'Close') {
      this.Meeting = [];
    } else {
      this.filters(this.dayValue, this.oldcolor);
      if (type != '') {
        this.Meeting.forEach(x => {
          x.Notes = x.Notes.filter(z => z.Type == type);
        });
      } else if (status != '') {
        this.Meeting.forEach(x => {
          x.Notes = x.Notes.filter(z => z.Status == status);
        });
      }
    }

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
  plannerTitle: any = '';
  postGroupTask() {
    if (this.plannerTitle != '') {
      const plannerTask = {
        planId: "f1gIkgHvqEKFasL1-oUnJckACYr7",
        bucketId: "RQR9TEWI8UexaAykiqG6kMkANO_E",
        title: this.plannerTitle,
      }
      this.graphService.postGroupTask(plannerTask).then(res => {
        console.log('group plan task post', res);
      })
    }
    setTimeout(() => {
      this.getGroupTasks();
      this.plannerTitle = '';
    }, 2000);
  }
  plannerTasks: any = [];
  getGroupTasks() {
    this.graphService.getGroupTasks('f1gIkgHvqEKFasL1-oUnJckACYr7').then(res => {
      console.log('group plan get tasks', res);
      this.plannerTasks = res;
    });
  }
}
