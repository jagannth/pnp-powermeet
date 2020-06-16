import { GraphService } from 'src/app/services/graph.service';
import { Meeting } from './../../models/Meeting';
import { ProxyService } from './../../services/proxy.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/User';
import { DataService } from 'src/app/services/data.service';
import { Note } from 'src/app/models/Note';
import { ActivatedRoute } from '@angular/router';
import { NoteAudit } from 'src/app/models/NoteAudit';

@Component({
  selector: 'app-agenda-notes',
  templateUrl: './agenda-notes.component.html',
  styleUrls: ['./agenda-notes.component.css']
})
export class AgendaNotesComponent implements OnInit {

  constructor(private proxy: ProxyService, private dataService: DataService, private graphService: GraphService, private route: ActivatedRoute) { }
  meetingObject: Meeting;
  noteDescription: any;
  agendaInx: number = 0;
  notesArray: Array<Note>;
  noteDetail: Note;
  username: string;
  imgUrl: string = "../../../assets/images/Send-Icon.svg";
  colorsArray: any = ['lightgray', 'darkcyan', 'crimson', 'chocolate', 'darkgoldenrod', 'blue', 'purple', 'brown', 'chartreuse'];
  timer: any = { status: 'Start Meeting', time: '23' };
  ngOnInit(): void {
    this.username = sessionStorage.getItem('user');
    this.noteDetail = new Note();
    this.getGraphUsers();
    this.route.queryParams.subscribe(params => {
      this.getMeetingByID(params.Id);
      console.log('params', params);
    });
    document.getElementById('addMoreBtn').click();
    document.getElementById('descToggle').style.display = 'none';
    document.getElementById('descToggleImg').style.display = 'none';
  }
  getMeetingByID(Id) {
    this.proxy.Get('meetings/' + Id).subscribe(res => {
      console.log('response', res);
      this.meetingObject = res.Data.Meeting;
      this.getNotes(0);
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
  addNotes() {
    this.noteDetail.NoteAudit = new NoteAudit();
    this.noteDetail.AgendaID = this.meetingObject.AgendaItems[this.agendaInx].AgendaID;
    this.noteDetail.NoteAudit.CreatedDate = new Date();
    this.noteDetail.NoteAudit.UpdatedCount = 0;
    this.noteDetail.Status = 'Planned';
    this.noteDetail.GroupID = sessionStorage.getItem('groupId');

    console.log('this.note', this.noteDetail);
    this.proxy.Post('meetings/notes', this.noteDetail).subscribe(res => {
      console.log('post note res', res);
      this.noteDetail = new Note();
      this.getNotes(this.agendaInx);
    });
  }

  getNotes(inx) {
    this.agendaInx = inx;
    this.proxy.Get('meetings/notes/' + this.meetingObject.AgendaItems[inx].AgendaID).subscribe(res => {
      console.log('notes', res.Data);
      this.notesArray = res.Data;
    });
  }
  getReportNotes(Id) {
    this.proxy.Get('meetings/notes/' + Id).subscribe(res => {
      if (res) return res.Data;
      return [];
    });
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
  colpsBtn: number = 0;
  collpsHeight: string = '22rem';
  progressColor: string = '';
  timeLeft: number = 0;
  interval;
  colorInx: number;
  collapseBtn() {
    this.colpsBtn++;
    if (this.colpsBtn % 2 != 0) {
      this.collpsHeight = '8rem';
      document.getElementById('descToggle').style.display = 'none';
      document.getElementById('descToggleImg').style.display = 'none';
    }
    else {
      this.collpsHeight = '22rem';
      document.getElementById('descToggle').style.display = 'block';
      document.getElementById('descToggleImg').style.display = 'block';
    }
  }
  pauseTimer() {
    clearInterval(this.interval);
  }
  startMeeting(Id) {
    if (this.meetingObject.AgendaItems.length == this.agendaInx + 1) {
      this.timer.status = 'Completed';
      this.stopObject.status = false;
      this.pauseTimer();
      this.meetingObject.AgendaItems[this.agendaInx].Color = '#28a745';
      this.progressColor = '';
    }
    if (this.meetingObject.AgendaItems.length > this.agendaInx + 1) {
      if (Id == 0) { this.agendaInx = 0; this.stopWatch(); }
      else {
        this.meetingObject.AgendaItems[this.agendaInx].Color = '#28a745';
        this.agendaInx += 1
      };
      this.timer.status = 'In Progress';
      // this.stopObject.status = true;
      this.progressColor = '';
      this.getNotes(this.agendaInx);
      this.startTimer(this.agendaInx);
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
        this.progressColor = 'linear-gradient(to right,green ' + val + '%,lightgreen ' + val + '%)';
      } else {
        this.meetingObject.AgendaItems[inx].Color = '#28a745';
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
  getAllNotes() {
    this.meetingObject.AgendaItems.forEach(x => {
      this.proxy.Get('meetings/notes/' + x.AgendaID).subscribe(res => {
        x.Notes = res.Data;
      });
    })
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
  alertBtn(){
    (<HTMLDivElement>document.getElementById('alert')).style.display = 'none';
  }
}
