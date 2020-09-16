import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { MultiDataSet, Label, Colors } from 'ng2-charts';
import { SharePointDataServicesService } from "src/app/services/share-point-data-services.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { User } from 'src/app/models/User';
import { GraphService } from 'src/app/services/graph.service';
import { DataService } from 'src/app/services/data.service';
import { Meeting } from 'src/app/models/Meeting';
import { NgxSpinnerService } from 'ngx-spinner';
import { MeetingAttendees } from 'src/app/models/MeetingAttendees';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};


@Component({
  selector: 'app-mymeeting',
  templateUrl: './mymeeting.component.html',
  styleUrls: ['./mymeeting.component.css']
})
export class MymeetingComponent implements OnInit {

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
  public pieChartData: number[] = [30, 0, 40];
  public pieChartType: ChartType = 'doughnut';
  public pieChartLegend = true;
  public pieChartColors = [
    {
      backgroundColor: ['#3C88E8', '#3C88E8', '#E0E0FF'],
    },
  ];

  public doughnutChartLabels: Label[] = [];
  public doughnutChartData: MultiDataSet = [
    [350, 450, 100],
    [120, 0, 0],
  ];
  public chartColors: Array<any> = [
    { // all colors in order
      backgroundColor: ['#3C88E8', '#3C88E8', '#E0E0FF']
    }
  ];
  public doughnutChartType: ChartType = 'doughnut';


  public barChartOptions: ChartOptions = {
    responsive: true
  };
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: ChartDataSets[] = [
    { data: [1, 2, 3], label: 'Risk', stack: 'a' },
    { data: [1, 2, 3], label: 'Task', stack: 'a' },
    { data: [1, 2, 3], label: 'Decision', stack: 'a' },
  ];
  public barChartLabels: string[] = ['Training', 'Project', 'Workshop'];


  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-plus-square-o mr-2"></i>',
      a11yLabel: 'Agenda',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Agenda', event);
      },
    },
    {
      label: '<i class="fa fa-play mr-2"></i>',
      a11yLabel: 'Note',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        // this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Note', event);
      },
    },
  ];
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;

  meetingsList: any = [];
  constructor(private modal: NgbModal, private router: Router, private graphService: GraphService,
    private dataService: DataService, public spinner: NgxSpinnerService, private shrService: SharePointDataServicesService) { }
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }
  ngOnInit() {
    this.getGraphUsers();
    this.spinner.show();
    this.meetingsList = new Array<Meeting>();
    const group = sessionStorage.getItem("groupId");
    if (group == undefined || group == "undefined") {
      console.log("console if");
      this.getMeetings(sessionStorage.getItem("user"), "0");
    } else {
      console.log("console else");
      this.getMeetings("group", group);
    }
    // setTimeout(() => {
    this.spinner.hide();
    //   this.getUsersList();
    // }, 3000);
  }
  async getGraphUsers() {
    await this.graphService.getUsers().then((res) => {
      console.log("users list response ", res);
      const users = new Array<User>();
      res.forEach((x) => {
        console.log("users list response ", x);
        const user = new User();
        user.id = x.id;
        user.fullname = x.displayName;
        user.email = x.userPrincipalName;
        if (x.givenName) {
          user.displayName = x.givenName.slice(0, 1) + x.surname.slice(0, 1);
        }
        this.graphService
          .getUserProfile(x.userPrincipalName)
          .then((res) => {
            if (res) {
              let reader = new FileReader();
              reader.addEventListener(
                "load",
                () => {
                  user.file = reader.result;
                  user.status = true;
                },
                false
              );
              if (res) {
                reader.readAsDataURL(res);
              }
            }
          })
          .catch((error) => {
            console.log("error", error);
            user.status = false;
          });
        users.push(user);
      });
      console.log("usersss", users);
      this.dataService.updatedDataSelection(users);
    });
  }
  usersList: Array<User>;
  getUsersList() {
    this.dataService.data.subscribe((res) => {
      this.usersList = res;
      console.log("users res ", this.usersList);
    });
  }
  getMeetings(Value, Id) {
    this.shrService
      .getMeetings(sessionStorage.getItem("groupId"))
      .then((res) => {
        const responseArray = [];
        const responseArray1 = [];
        console.log("sharepoint response", res);
        res.forEach((x) => {
          console.log("meetings Id", Id, x.fields);
          if (
            Id == "0" &&
            x.fields.IsGroup == false &&
            x.fields.Organizer == sessionStorage.getItem("user")
          ) {
            const meeting = new Meeting();
            console.log("meetings If", x.fields.IsGroup);
            meeting.MeetingID = x.fields.id;
            meeting.MeetingName = x.fields.Title;
            meeting.IsGroup = x.fields.IsGroup;
            meeting.IsRecurring = x.fields.IsRecurring;
            meeting.Organizer = x.fields.Organizer;
            meeting.MeetingDescription = x.fields.MeetingDescription;
            meeting.StartDate = x.fields.StartDateTime;
            // if (x.fields.MeetingType) {
            meeting.MeetingType = x.fields.MeetingType;
            // }
            var nameArr = x.fields.MeetingAttendees.split("|");
            nameArr.forEach((element) => {
              const attendee = new MeetingAttendees();
              attendee.Email = element;
              if (element != "" && element != "TestSite99@sticsoft.io") {
                meeting.MeetingAttendees.push(attendee);
              }
            });
            responseArray.push(meeting);
          } else if (Id != "0" && x.fields.IsGroup == true) {
            console.log("meetings else", x.fields.IsGroup);
            const meeting = new Meeting();
            meeting.MeetingID = x.fields.id;
            meeting.MeetingName = x.fields.Title;
            meeting.IsGroup = x.fields.IsGroup;
            meeting.IsRecurring = x.fields.IsRecurring;
            meeting.MeetingDescription = x.fields.MeetingDescription;
            meeting.StartDate = x.fields.StartDateTime;
            meeting.MeetingType = x.fields.MeetingType;
            meeting.Organizer = x.fields.Organizer;
            var nameArr = x.fields.MeetingAttendees.split("|");
            nameArr.forEach((element) => {
              const attendee = new MeetingAttendees();
              attendee.Email = element;
              if (element != "" && element != "TestSite99@sticsoft.io") {
                meeting.MeetingAttendees.push(attendee);
              }
            });
            responseArray1.push(meeting);
          }
        });
        if (Id == "0") {
          console.log("responseArray", responseArray);
          this.meetingsList = responseArray;
        } else {
          console.log("responseArray1", responseArray);
          this.meetingsList = responseArray1;
        }
        // this.meetingsList = this.meetingsList.filter(
        //   (x) =>
        //     formatDate(x.StartDate, "yyyy/MM/dd", "en") ===
        //       formatDate(new Date(), "yyyy/MM/dd", "en") ||
        //     x.IsRecurring == true
        // );
        this.getGraphEvents(Id);
        console.log("todays meeting list", this.meetingsList);
        this.getCalendarEvents();
      });
  }
  getCalendarEvents() {
    this.meetingsList.forEach(x => {
      const eve = {
        id: x.MeetingID,
        start: new Date(x.StartDate),
        end: addDays(new Date(x.StartDate), 1),
        title: x.MeetingName,
        color: colors.red,
        actions: this.actions,
        allDay: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
        draggable: true,
      }
      this.events.push(eve);
    });
    console.log('calendar events', this.events);
  }
  getGraphEvents(Id) {
    if (Id == "0") {
      this.graphService.getEvents().then((res) => {
        console.log("ind events", res);
        this.structEvent(res, Id);
      });
    } else {
      this.graphService
        .getGroupEvents("54b63089-c127-4cd9-9dd5-72013c0c3eaa")
        .then((res) => {
          console.log("group events", res);
          this.structEvent(res, Id);
        });
    }
  }
  CheckMeetings(obj) {
    const val = this.meetingsList.filter((x) => x.MeetingName === obj.subject);
    console.log("return val", val);
    if (val.length > 0) return true;
    else return false;
  }
  structEvent(res, Id) {
    const resObj = res.filter(
      (x) => !this.CheckMeetings(x)
    );
    resObj.forEach((x) => {
      const meeting = new Meeting();
      meeting.MeetingID = "00000000-0000-0000-0000-000000000000";
      meeting.MeetingName = x.subject;
      meeting.MeetingDescription = x.subject;
      meeting.StartDate = x.start.dateTime;
      meeting.EndDate = x.end.dateTime;
      if (Id != "0") {
        meeting.IsGroup = true;
        meeting.GroupID = Id;
      }
      if (x.recurrence) {
        meeting.IsRecurring = true;
      }

      meeting.Organizer = x.organizer.emailAddress.address;
      meeting.UserName = x.organizer.emailAddress.address;
      x.attendees.forEach((element) => {
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
  }
  addMeeting(Data: Meeting, Id) {
    var isgroup: boolean;
    if (Id == "0") {
      isgroup = false;
    } else {
      isgroup = true;
    }
    let attendee: string = "";
    Data.MeetingAttendees.forEach((y) => {
      attendee += y.Email + "|";
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
        MeetingAttendees: attendee,
      },
    };
    this.shrService
      .postMeeting(sessionStorage.getItem("groupId"), listItem)
      .then((res) => {
        console.log("post meeting status", res);
        const meeting = new Meeting();
        meeting.MeetingID = res.fields.id;
        meeting.MeetingName = res.fields.Title;
        meeting.MeetingDescription = res.fields.MeetingDescription;
        meeting.StartDate = res.fields.StartDateTime;
        meeting.Organizer = res.fields.Organizer;
        var nameArr = res.fields.MeetingAttendees.split("|");
        nameArr.forEach((element) => {
          const attendee = new MeetingAttendees();
          attendee.Email = element;
          if (element != "" && element != "TestSite99@sticsoft.io") {
            meeting.MeetingAttendees.push(attendee);
          }
        });
        this.meetingsList.push(meeting);
      });
  }
  // calendar events start

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    console.log('clickedddd');
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log('eventttt', action, event);
    if (action == 'Note') {
      this.router.navigate(['/Notes'], { queryParams: { Id: event.id, 'start': 'true' } });
    } else {
      const meeting = this.meetingsList.find(x => x.MeetingID == event.id);
      sessionStorage.setItem("meetingobj", JSON.stringify(meeting));
      sessionStorage.setItem("meetingId", meeting.MeetingID);
      this.router.navigate(["/MeetingDetails"]);
    }
    // this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
  // calendar events end
}
