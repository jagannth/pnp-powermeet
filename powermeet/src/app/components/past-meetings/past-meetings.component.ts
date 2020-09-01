import { Component, OnInit } from '@angular/core';
import { ProxyService } from 'src/app/services/proxy.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GraphService } from 'src/app/services/graph.service';
import { formatDate } from '@angular/common';
import { Meeting } from 'src/app/models/Meeting';
import { MeetingAttendees } from 'src/app/models/MeetingAttendees';
import { User } from 'src/app/models/User';
import { DataService } from 'src/app/services/data.service';
import { SharePointDataServicesService } from 'src/app/services/share-point-data-services.service';
import * as moment from 'moment';
@Component({
  selector: 'app-past-meetings',
  templateUrl: './past-meetings.component.html',
  styleUrls: ['./past-meetings.component.css']
})
export class PastMeetingsComponent implements OnInit {
  meetingsList: any = [];
  meetingsList1: any = {};
  meetingsListcompleted: any = {};
  attendslist: any = [];
  colorsArray: any = ['lightgray', 'darkcyan', 'crimson', 'chocolate', 'darkgoldenrod', 'blue', 'purple', 'brown', 'chartreuse']
  constructor(private dataService: DataService, private proxy: ProxyService, private router: Router, private shrService: SharePointDataServicesService, private graphService: GraphService) { }

  ngOnInit(): void {
    // this.meetingsList = new Array<Meeting>();
    const group = sessionStorage.getItem('groupId');
    document.getElementById('todayactive').classList.remove('active');
    if (group == undefined || group == 'undefined') {
      console.log('console if');
      this.getMeetings(sessionStorage.getItem('user'), '0');
    } else {
      console.log('console else');
      this.getMeetings('group', group);
    }
    this.getUsersList();
  }
  getmeeting(meeting) {
    sessionStorage.setItem("meetingobj", JSON.stringify(meeting));
    this.router.navigate(['/MeetingDetails']);
  }
  getMeetings(value, Id) {
    // this.proxy.Get('meetings/organizer?email='+sessionStorage.getItem('user')+ '&groupId='+sessionStorage.getItem('groupId')).subscribe(res => {
    //   const resObj = res.Data.Meetings.filter(x => formatDate(x.StartDate, 'yyyy/MM/dd', 'en') < formatDate(new Date(), 'yyyy/MM/dd', 'en'));
    //   this.meetingsList = resObj;
    //   // this.meetingsList1 = this.meetingsList.filter(x => this.ConvertMeeting(x.StartDate) < new Date());
    //   this.meetingsListcompleted = this.meetingsList.filter(x => x.Status === "Completed");
    //   console.log("Meetingslist", this.meetingsList);
    //   this.getGraphEvents();
    //   // if (this.meetingsList)
    //   // this.getTodayMeetings();
    // })
    this.shrService.getMeetings(sessionStorage.getItem('groupId')).then((res) => {
      const responseArray = [];
      const responseArray1 = [];
      res.forEach(x => {
        const meeting = new Meeting();
        meeting.MeetingID = x.fields.id;
        meeting.MeetingName = x.fields.Title;
        meeting.MeetingDescription = x.fields.MeetingDescription;
        meeting.StartDate = x.fields.StartDateTime;
        if ((Id == '0' && x.fields.IsGroup == false) && x.fields.Organizer == sessionStorage.getItem('user')) {
          responseArray.push(meeting);
        }else if(Id != '0' && x.fields.IsGroup == true){
          responseArray1.push(meeting);
        }
      });
      if(Id == '0'){
        this.meetingsList = responseArray;
      }else{
        this.meetingsList = responseArray1;
      }
      // this.meetingsList = this.meetingsList.filter(x => (formatDate(x.StartDate, 'yyyy/MM/dd', 'en') < formatDate(new Date(), 'yyyy/MM/dd', 'en') || x.IsRecurring == true));
      this.meetingsList = this.meetingsList.filter(x => new Date(this.ConvertTolocal(x.StartDate).toString()).getHours() < new Date().getHours());
      this.getGraphEvents();
      console.log('past meeting list', this.meetingsList);
    })
  }
  ConvertTolocal(datestr) {
    return moment.utc(datestr).local();
  }
  getGraphEvents() {
    this.graphService.getGroupEvents("54b63089-c127-4cd9-9dd5-72013c0c3eaa").then((res) => {
      console.log('graph events', res);
      const resObj = res.filter(x => formatDate(x.start.dateTime, 'yyyy/MM/dd', 'en') < formatDate(new Date(), 'yyyy/MM/dd', 'en'));
      resObj.forEach(x => {
        const meeting = new Meeting();
        meeting.MeetingName = x.subject;
        meeting.StartDate = x.start.dateTime;
        meeting.EndDate = x.end.EndDate;
        meeting.Organizer = x.organizer.emailAddress.addresss;
        this.meetingsList.push(meeting);
      });
    })
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
  getapprovedcount(obj) {
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
    return yourDate;
  }
}
