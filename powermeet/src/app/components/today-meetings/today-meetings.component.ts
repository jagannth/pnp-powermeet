import { Component, OnInit } from '@angular/core';
import { ProxyService } from 'src/app/services/proxy.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Meeting } from 'src/app/models/Meeting';
import { AuthService } from 'src/app/services/auth.service';
import { GraphService } from 'src/app/services/graph.service';
import { formatDate } from '@angular/common';
import { MeetingAttendees } from 'src/app/models/MeetingAttendees';
import { DomSanitizer } from "@angular/platform-browser";
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/models/User';
import * as moment from 'moment';
import { async } from '@angular/core/testing';
declare var $: any;

import * as microsoftTeams from "@microsoft/teams-js";
import { SharePointDataServicesService } from 'src/app/services/share-point-data-services.service';

@Component({
  selector: 'app-today-meetings',
  templateUrl: './today-meetings.component.html',
  styleUrls: ['./today-meetings.component.css']
})
export class TodayMeetingsComponent implements OnInit {
  meetingsList: any = [];
  meetingsListcompleted: any = [];
  meetingsListcompleted1: any = [];
  meetingsList1: any = [];
  attendslist: any = [];
  colorsArray: any = ['lightgray', 'darkcyan', 'crimson', 'chocolate', 'darkgoldenrod', 'blue', 'purple', 'brown', 'chartreuse']
  constructor(private proxy: ProxyService, private router: Router,
    public spinner: NgxSpinnerService, private authService: AuthService,
    private graphService: GraphService, private sanitizer: DomSanitizer, private dataService: DataService, private shrService: SharePointDataServicesService, private graphSrv: GraphService) { }

  async ngOnInit() {
    this.getGraphUsers();
    // this.joinMeetingInterval();
    this.spinner.show();
    this.meetingsList = new Array<Meeting>();
    this.usersList = new Array<User>();
    const group = sessionStorage.getItem('groupId');
    if (group == undefined || group == 'undefined') {
      console.log('console if');
      this.getMeetings(sessionStorage.getItem('user'), '0');
    } else {
      console.log('console else');
      this.getMeetings('group', group);
    }
    setTimeout(() => {
      this.spinner.hide();
      this.getUsersList();
    }, 3000);
  }
  heading:string;
  oldcolor:string;
  isWeek:boolean = false;
  filters(val: string, id) {
    if(val == 'Day'){
      this.isWeek = false;
      (<HTMLLIElement>document.getElementById(id)).classList.add('active');
      (<HTMLLIElement>document.getElementById('woid1')).classList.remove('active');
    }else{
      this.isWeek = true;
      (<HTMLLIElement>document.getElementById(id)).classList.add('active');
      (<HTMLLIElement>document.getElementById('toid1')).classList.remove('active');
    }
    // this.dayValue = val;
    // if (this.oldcolor != "") {
    //   $("#" + this.oldcolor).removeClass('active');
    //   $("#toid").removeClass('active');
    // }
    // $("#" + id).addClass('active');
    // this.oldcolor = id;
    // this.filteredData = JSON.parse(sessionStorage.getItem('orgMeeting'));
    // if (val == 'Day') {
    //   this.heading = 'Today Meeting Items';
    //   this.overviewDate = formatDate(new Date(), 'dd/MM/yyyy', 'en');
    //   this.Meeting = this.filteredData.filter(x => (formatDate(x.StartDate, 'yyyy/MM/dd', 'en') == formatDate(new Date(), 'yyyy/MM/dd', 'en')) || x.IsRecurring == true);
    // }
    // else if (val == 'Week') {
    //   const date = new Date();
    //   date.setDate(date.getDate() - 7);
    //   this.overviewDate = formatDate(date, 'dd/MM/yyyy', 'en') + ' - ' + formatDate(new Date(), 'dd/MM/yyyy', 'en');
    //   this.heading = 'This Week Meeting Items';
    //   this.Meeting = this.filteredData.filter(x => formatDate(x.StartDate, 'yyyy/MM/dd', 'en') >= formatDate(date, 'yyyy/MM/dd', 'en') || x.IsRecurring == true);
    // } else if (val == 'Month') {
    //   const date = new Date();
    //   date.setDate(date.getDate() - 30);
    //   this.overviewDate = formatDate(date, 'dd/MM/yyyy', 'en') + ' - ' + formatDate(new Date(), 'dd/MM/yyyy', 'en');
    //   this.heading = 'This Month Meeting Items';
    //   this.Meeting = this.filteredData.filter(x => formatDate(x.StartDate, 'yyyy/MM/dd', 'en') >= formatDate(date, 'yyyy/MM/dd', 'en') || x.IsRecurring == true);
    // } else {
    //   console.log('date', val);
    //   this.overviewDate = formatDate(val, 'dd/MM/yyyy', 'en');
    //   this.heading = formatDate(val, 'dd/MM/yyyy', 'en') + ' Meeting Items';
    //   this.Meeting = this.filteredData.filter(x => formatDate(x.StartDate, 'yyyy/MM/dd', 'en') == formatDate(val, 'yyyy/MM/dd', 'en'));
    // }
    // console.log('filter data', this.filteredData);
    // console.log('meeting data', this.Meeting);
  }
  async getGraphUsers() {
   await this.graphService.getUsers().then((res) => {
      console.log('users list response ', res);
      const users = new Array<User>();
      res.forEach(x => {
        console.log('users list response ', x);
        const user = new User();
        user.id = x.id;
        user.fullname = x.displayName;
        user.email = x.userPrincipalName;
        if(x.givenName){
          user.displayName = x.givenName.slice(0, 1) + x.surname.slice(0, 1);
        }
        user.card = `<div class="card" style="width: 18rem;border: none;text-align: left;"><h6>${user.fullname}</h6><p>${user.email}</p></div>`;
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
      console.log('usersss', users);
      this.dataService.updatedDataSelection(users);
    });
  }
  usersList: Array<User>;
  getUsersList() {
    this.dataService.data.subscribe(res => {
      this.usersList = res;
      console.log('users res ', this.usersList);
    });
  }
  getMeetings(Value, Id) {
    this.shrService.getMeetings(sessionStorage.getItem('groupId')).then((res) => {
      const responseArray = [];
      const responseArray1 = [];
      console.log('sharepoint response', res);
      res.forEach(x => {
        console.log('meetings Id', Id, x.fields);
        if ((Id == '0' && x.fields.IsGroup == false) && x.fields.Organizer == sessionStorage.getItem('user')) {
          const meeting = new Meeting();
          console.log('meetings If', x.fields.IsGroup);
          meeting.MeetingID = x.fields.id;
          meeting.MeetingName = x.fields.Title;
          meeting.IsGroup = x.fields.IsGroup;
          meeting.IsRecurring = x.fields.IsRecurring;
          meeting.Organizer = x.fields.Organizer
          meeting.MeetingDescription = x.fields.MeetingDescription;
          meeting.StartDate = x.fields.StartDateTime;
          // if (x.fields.MeetingType) {
          meeting.MeetingType = x.fields.MeetingType;
          // }
          var nameArr = x.fields.MeetingAttendees.split('|');
          nameArr.forEach(element => {
            const attendee = new MeetingAttendees();
            attendee.Email = element;
            if (element != '' && element != 'TestSite99@sticsoft.io') { meeting.MeetingAttendees.push(attendee); }
          });
          responseArray.push(meeting);
        }
        else if (Id != '0' && x.fields.IsGroup == true) {
          console.log('meetings else', x.fields.IsGroup);
          const meeting = new Meeting();
          meeting.MeetingID = x.fields.id;
          meeting.MeetingName = x.fields.Title;
          meeting.IsGroup = x.fields.IsGroup;
          meeting.IsRecurring = x.fields.IsRecurring;
          meeting.MeetingDescription = x.fields.MeetingDescription;
          meeting.StartDate = x.fields.StartDateTime;
          meeting.MeetingType = x.fields.MeetingType;
          var nameArr = x.fields.MeetingAttendees.split('|');
          nameArr.forEach(element => {
            const attendee = new MeetingAttendees();
            attendee.Email = element;
            if (element != '' && element != 'TestSite99@sticsoft.io') { meeting.MeetingAttendees.push(attendee); }
          });
          responseArray1.push(meeting);
        }
      });
      if (Id == '0') {
        console.log('responseArray', responseArray);
        this.meetingsList = responseArray;
      } else {
        console.log('responseArray1', responseArray);
        this.meetingsList = responseArray1;
      }
      this.meetingsList = this.meetingsList.filter(x => (formatDate(x.StartDate, 'yyyy/MM/dd', 'en') === formatDate(new Date(), 'yyyy/MM/dd', 'en') || x.IsRecurring == true));
      this.getGraphEvents(Id);
      console.log('todays meeting list', this.meetingsList);
    })
  }
  getGraphEvents(Id) {
    if (Id == '0') {
      this.graphService.getEvents().then((res) => {
        console.log('ind events', res);
        this.structEvent(res, Id);
      });
    } else {
      this.graphService.getGroupEvents("54b63089-c127-4cd9-9dd5-72013c0c3eaa").then((res) => {
        console.log('group events', res);
        this.structEvent(res, Id);
      });
    }
  }
  structEvent(res, Id) {
    const resObj = res.filter(x => (formatDate(x.start.dateTime, 'yyyy/MM/dd', 'en') === formatDate(new Date(), 'yyyy/MM/dd', 'en')) && (!this.CheckMeetings(x)));
    resObj.forEach(x => {
      const meeting = new Meeting();
      meeting.MeetingID = "00000000-0000-0000-0000-000000000000";
      meeting.MeetingName = x.subject;
      meeting.MeetingDescription = x.subject;
      meeting.StartDate = x.start.dateTime;
      meeting.EndDate = x.end.dateTime;
      if (Id != '0') {
        meeting.IsGroup = true;
        meeting.GroupID = Id;
      }
      if (x.recurrence) {
        meeting.IsRecurring = true;
      }

      meeting.Organizer = x.organizer.emailAddress.address;
      meeting.UserName = x.organizer.emailAddress.address;
      x.attendees.forEach(element => {
        const attendee = new MeetingAttendees();
        attendee.Email = element.emailAddress.address;
        meeting.MeetingAttendees.push(attendee);
        //   console.log(attendee);
      });
      meeting.AgendaItems = [];
      if (x.isOrganizer == true) {
        this.addMeeting(meeting, Id);
      }
    });
    // this.meetingsList.sort(this.GFG_sortFunction);
    // this.meetingsList1 = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() > new Date().getHours());
    // this.meetingsListcompleted1 = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() >= new Date().getHours());
    // this.meetingsListcompleted.sort(this.GFG_sortFunction);
    this.meetingsListcompleted1 = this.meetingsList;
    sessionStorage.setItem('Mcount', this.meetingsList);
  }
  addMeeting(Data: Meeting, Id) {
    // const val = sessionStorage.getItem('user');
    // var frmData = new FormData();
    // const ResponseObject: string = JSON.stringify(Data);
    // frmData.append('meetingResponse', ResponseObject);
    // this.proxy.Post('meetings', frmData).subscribe(res => {
    //   console.log('added data', res.Data.Meeting);
    //   if (res.Data.Meeting.MeetingID !== "00000000-0000-0000-0000-000000000000") {
    //     this.meetingsList.push(res.Data.Meeting);
    //     console.log('111 meeting list', this.meetingsList);
    //     this.meetingsList.sort(this.GFG_sortFunction);
    //     this.meetingsList1 = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() > new Date().getHours());
    //     this.meetingsListcompleted = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() < new Date().getHours());
    //     this.meetingsListcompleted.sort(this.GFG_sortFunction);
    //     this.meetingsListcompleted1 = this.meetingsListcompleted;
    //     console.log('111 aaaa', this.meetingsList1);
    //     sessionStorage.setItem('Mcount', this.meetingsList.length);
    //   }
    // });
    var isgroup: boolean;
    if (Id == '0') {
      isgroup = false;
    } else {
      isgroup = true;
    }
    let attendee: string = '';
    Data.MeetingAttendees.forEach(y => {
      attendee += y.Email + '|';
    });
    const listItem = {
      fields: {
        Title: Data.MeetingName,
        MeetingDescription: Data.MeetingDescription,
        MeetingID: "123433",
        StartDateTime: Data.StartDate,
        EndDateTime: Data.EndDate,
        Organizer: Data.Organizer,
        Time: "30",
        IsMeetingActive: true,
        IsRecurring: Data.IsRecurring,
        IsGroup: isgroup,
        GroupID: Data.GroupID,
        MeetingAttendees: attendee
      }
    }
    this.shrService.postMeeting(sessionStorage.getItem('groupId'), listItem).then(res => {
      console.log('post meeting status', res);
      const meeting = new Meeting();
      meeting.MeetingID = res.fields.id;
      meeting.MeetingName = res.fields.Title;
      meeting.MeetingDescription = res.fields.MeetingDescription;
      meeting.StartDate = res.fields.StartDateTime;
      var nameArr = res.fields.MeetingAttendees.split('|');
      nameArr.forEach(element => {
        const attendee = new MeetingAttendees();
        attendee.Email = element;
        if (element != '' && element != 'TestSite99@sticsoft.io') { meeting.MeetingAttendees.push(attendee); }
      });
      this.meetingsList.push(meeting);
      // this.meetingsList.sort(this.GFG_sortFunction);
      // this.meetingsList1 = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() > new Date().getHours());
      // this.meetingsListcompleted = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() < new Date().getHours());
      // this.meetingsListcompleted.sort(this.GFG_sortFunction);
      this.meetingsListcompleted1 = this.meetingsList;
    })
  }

  CheckMeetings(obj) {
    const val = this.meetingsList.filter(x => x.MeetingName === obj.subject);
    console.log('return val', val)
    if (val.length > 0)
      return true;
    else
      return false;
  }
  GFG_sortFunction(a, b) {
    var dateA = new Date(a.StartDate).getHours();
    var dateB = new Date(b.StartDate).getHours();
    return dateA > dateB ? 1 : -1;
  }
  getmeeting(meeting) {
    sessionStorage.setItem("meetingobj", JSON.stringify(meeting));
    sessionStorage.setItem("meetingId", meeting.MeetingID);
    this.router.navigate(['/MeetingDetails']);
  }
  organizerMail: string;
  getTodayMeetings() {
    this.proxy.Get('users/' + sessionStorage.getItem("userid").toString() + '/events').subscribe(res => {
      //this.meetingsList = res.Data.Meetings;

      console.log("TodaysMeetingslist", res);
      // var data=null;

      for (var i = 0; i < res.Data.length; i++) {
        if (this.ConvertMeeting(res.Data[i].start.dateTime) === new Date().toDateString()) {
          let data = null;
          console.log("subject", res.Data[i].subject);
          data = this.meetingsList1.find(x => x.MeetingName === res.Data[i].subject);
          console.log("dataaa", data);
          if (data == null || data == undefined) {

            for (var j = 0; j < res.Data[i].attendees.length; j++) {
              let attends: any = {};
              attends = {
                "MeetingAttendeesID": "00000000-0000-0000-0000-000000000000",
                "MeetingID": "00000000-0000-0000-0000-000000000000",
                "Email": res.Data[i].attendees[j].emailAddress.address
              }
              this.attendslist.push(attends)
            }
            let meetingObj: any = {};
            let isrec = false;
            if (res.Data[i].type === "singleInstance") { isrec = false } else { isrec = true }
            meetingObj = {
              "MeetingID": "00000000-0000-0000-0000-000000000000",
              "MeetingName": res.Data[i].subject,
              "MeetingDescription": res.Data[i].subject,
              "Status": "",
              "StartDate": res.Data[i].start.dateTime,
              "EndDate": res.Data[i].end.dateTime,
              "Organizer": res.Data[i].organizer.emailAddress.address,
              //  "audience": "",
              "Time": "2020-02-25T10:20:20.33Z",
              "IsActive": true,
              "IsRecurring": isrec,
              "AgendaItems": [],
              "MeetingAttendees": this.attendslist,
              "Errors": []
            }
            this.meetingsList1.push(meetingObj);
          }
        }
      }
      console.log("TodaysMeetingslistupdated", this.meetingsList1);
      this.meetingsList1.forEach((x, index) => {
        if (x.MeetingID == '00000000-0000-0000-0000-000000000000') {
          this.addMeeting(x, '0');
        }
      });

      // this.spinner.hide();
    });
  }
  getapprovedcount(obj) {
    // console.log(obj);
    var objcount = null;
    if (obj !== null && obj !== undefined) {
      objcount = obj.filter(x => x.IsApproved === true);
    }
    if (objcount !== null && objcount !== undefined)
      return objcount.length;
    else
      return 0;
  }
  ConvertMeeting(datestr) {
    let yourDate = new Date(datestr);
    console.log('MetingDatetiem', yourDate.toDateString());
    console.log('TodayDatetiem', new Date().toDateString());
    return yourDate.toDateString();
  }
  ConvertTolocal(datestr) {
    // let yourDate = new Date(datestr);
    // console.log('MetingDatetiem', yourDate.toDateString());
    // console.log('TodayDatetiem', new Date().toDateString());
    // return yourDate.toDateString();
    return moment.utc(datestr).local();
  }

  getStatus(email): User {
    const data = this.usersList.find(x => x.email === email);
    return data;
  }
  meetingTypeUpdate(value: any, meeting: Meeting) {
    console.log('value', value);
    const listItem = {
      fields: {
        Title: meeting.MeetingName,
        MeetingType: value
      }
    }
    // this.meetingsListcompleted1[index].MeetingType = value;
    this.shrService.putMeeting(meeting.MeetingID, listItem).then(res => {
      console.log('meeting type update response', res);
    });
  }
  interval;
  channelMeetingArr: any = [];
  joinMeetingInterval() {
    this.pauseTimer();
    this.interval = setInterval(() => {
      this.meetingsListcompleted1.forEach(x => {
        console.log('startdate', new Date(this.ConvertTolocal(x.StartDate).toString()).getHours());
        console.log('localdate', new Date().getHours());
        if (new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() == new Date().getHours()) {
          console.log('success');
          const join = this.channelMeetingArr.find(z => z == x.MeetingID);
          if (!join) {
            this.joinMeeting(x.MeetingName, x.MeetingID);
            this.channelMeetingArr.push(x.MeetingID);
          }
        }
      });
    }, 100000)
  }
  pauseTimer() {
    clearInterval(this.interval);
  }
  joinMeeting(name, Id) {
    let body = {
      "subject": null,
      "body": {
        "contentType": "html",
        "content": "<attachment id=\"74d20c7f34aa4a7fb74e2b30004247c5\"></attachment>"
      },
      "attachments": [
        {
          "id": "74d20c7f34aa4a7fb74e2b30004247c5",
          "contentType": "application/vnd.microsoft.card.thumbnail",
          "contentUrl": null,
          "content": `{\r\n  \"title\": \"${name} is started. \",\r\n  \"text\": \"Click here to.\\r\\n <a href='https://teams.microsoft.com/l/entity/af49f63f-8dd5-417b-b3f5-96658fa88dbd/_djb2_msteams_prefix_2521105317?context=%7B%22subEntityId%22%3A${Id}%2C%22channelId%22%3A%2219%3A66897d02aa6745428f4c8117cc197f39%40thread.tacv2%22%7D&groupId=54b63089-c127-4cd9-9dd5-72013c0c3eaa&tenantId=84a9843b-0b29-4729-ba8a-8155cf55c7ae'>Join</a>. <br>\\r\\n \"}`,
          "name": null,
          "thumbnailUrl": null
        }
      ]
    }
    this.graphSrv.postChannelMessage(body).then(res => {
      console.log('Channel message res', res);
    });
  }
}
