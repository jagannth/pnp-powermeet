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
    private graphService: GraphService, private sanitizer: DomSanitizer, private dataService: DataService, private shrService: SharePointDataServicesService) { }
  async ngOnInit() {
    this.spinner.show();
    this.meetingsList = new Array<Meeting>();
    const group = sessionStorage.getItem('groupId');
    if (group == undefined || group == 'undefined') {
      console.log('console if');
      this.getMeetings(sessionStorage.getItem('user'), '0');
    } else {
      console.log('console else');
      this.getMeetings('group', group); 
    }
    this.getGraphUsers();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }
  getGroupMeetings(Id) {
    this.graphService.getGroupEvents(Id).then((res) => {
      console.log('group events', res);
    });
  }
  getMeetings(Value, Id) {
    this.shrService.getMeetings(sessionStorage.getItem('groupId')).then((res) => {
      const responseArray = [];
      const responseArray1 = [];
      res.forEach(x => {
        console.log('meetings Id', Id,x.fields);
        if ((Id == '0' && x.fields.IsGroup == false) && x.fields.Organizer == sessionStorage.getItem('user')) {
          const meeting = new Meeting();
          console.log('meetings If', x.fields.IsGroup);
          meeting.MeetingID = x.fields.id;
          meeting.MeetingName = x.fields.Title;
          meeting.IsGroup = x.fields.IsGroup;
          meeting.Organizer = x.fields.Organizer
          meeting.MeetingDescription = x.fields.MeetingDescription;
          meeting.StartDate = x.fields.StartDateTime;
          var nameArr = x.fields.MeetingAttendees.split('|');
          nameArr.forEach(element => {
            const attendee = new MeetingAttendees();
            attendee.Email = element;
            if (element != '' && element != 'TestSite99@sticsoft.io') { meeting.MeetingAttendees.push(attendee); }
          });
          responseArray.push(meeting);
        }
        else if(Id != '0' && x.fields.IsGroup == true){
          console.log('meetings else', x.fields.IsGroup);
          const meeting = new Meeting();
          meeting.MeetingID = x.fields.id;
          meeting.MeetingName = x.fields.Title;
          meeting.IsGroup = x.fields.IsGroup;
          meeting.MeetingDescription = x.fields.MeetingDescription;
          meeting.StartDate = x.fields.StartDateTime;
          var nameArr = x.fields.MeetingAttendees.split('|');
          nameArr.forEach(element => {
            const attendee = new MeetingAttendees();
            attendee.Email = element;
            if (element != '' && element != 'TestSite99@sticsoft.io') { meeting.MeetingAttendees.push(attendee); }
          });
          responseArray1.push(meeting);
        }
      });
      if(Id == '0'){
        console.log('responseArray', responseArray);
        this.meetingsList = responseArray;
      }else{
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
    // console.log('graph response today object', resObj);
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
      meeting.IsRecurring = false;

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
    this.meetingsList.sort(this.GFG_sortFunction);
    this.meetingsList1 = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() > new Date().getHours());
    this.meetingsListcompleted = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() < new Date().getHours());
    this.meetingsListcompleted.sort(this.GFG_sortFunction);
    this.meetingsListcompleted1 = this.meetingsListcompleted;
    sessionStorage.setItem('Mcount', this.meetingsList.length);
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
        IsRecurring: false,
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
      this.meetingsList.sort(this.GFG_sortFunction);
      this.meetingsList1 = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() > new Date().getHours());
      this.meetingsListcompleted = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() < new Date().getHours());
      this.meetingsListcompleted.sort(this.GFG_sortFunction);
      this.meetingsListcompleted1 = this.meetingsListcompleted;
    })
  }

  CheckMeetings(obj) {
    const val = this.meetingsList.filter(x => x.MeetingName === obj.subject);
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
  usersList: Array<User>;
  getUsersList() {
    this.dataService.data.subscribe(res => {
      this.usersList = res;
      console.log('users res ', this.usersList);
    });
  }
  getStatus(email): User {
    const data = this.usersList.find(x => x.email === email);
    return data;
  }
}
