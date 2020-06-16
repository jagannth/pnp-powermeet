import { Component, OnInit } from '@angular/core';
import { ProxyService } from 'src/app/services/proxy.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GraphService } from 'src/app/services/graph.service';
import { formatDate } from '@angular/common';
import { Meeting } from 'src/app/models/Meeting';
import { User } from 'src/app/models/User';
import { DataService } from 'src/app/services/data.service';
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
  constructor(private dataService: DataService, private proxy: ProxyService, private router: Router, private authService: AuthService, private graphService: GraphService) { }

  ngOnInit(): void {
    this.meetingsList = new Array<Meeting>();
    this.getMeetings();
    this.getUsersList();

  }
  getmeeting(meeting) {
    sessionStorage.setItem("meetingobj", JSON.stringify(meeting));
    this.router.navigate(['/MeetingDetails']);
  }
  getMeetings() {
    this.proxy.Get('meetings/organizer?email='+sessionStorage.getItem('user')+ '&groupId='+sessionStorage.getItem('groupId')).subscribe(res => {
      const resObj = res.Data.Meetings.filter(x => formatDate(x.StartDate, 'yyyy/MM/dd', 'en') < formatDate(new Date(), 'yyyy/MM/dd', 'en'));
      this.meetingsList = resObj;
      // this.meetingsList1 = this.meetingsList.filter(x => this.ConvertMeeting(x.StartDate) < new Date());
      this.meetingsListcompleted = this.meetingsList.filter(x => x.Status === "Completed");
      console.log("Meetingslist", this.meetingsList);
      this.getGraphEvents();
      // if (this.meetingsList)
      // this.getTodayMeetings();
    })
  }
  getGraphEvents() {
    this.graphService.getEvents().then((res) => {
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
