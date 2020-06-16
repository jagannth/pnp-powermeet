import { Component, OnInit } from '@angular/core';
import { ProxyService } from 'src/app/services/proxy.service';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notificationList: any = [];
  colorsArray: any = ['lightgray', 'darkcyan', 'crimson', 'chocolate', 'darkgoldenrod', 'blue', 'purple', 'brown', 'chartreuse', 'pink', 'gold', 'green']

  constructor(private proxy: ProxyService, private dataService: DataService) { }

  ngOnInit(): void {
    this.getNotifcations();
    this.getUsersList();
  }
  usersList: Array<User>;
  getUsersList() {
    this.dataService.data.subscribe(res => {
      this.usersList = res;
      console.log('users res ', this.usersList);
    });
  }
  getUserStatus(email): User {
    console.log('usersss', email);
    const data = this.usersList.find(x => x.email === email);
    return data;
  }
  getNotifcations() {
    this.proxy.Get('meetings/notifications').subscribe(res => {
      console.log('notifications', res.Data);
      this.notificationList = res.Data;
    })
  }
  typeList: any = [{ Id: '2edcd9d6-eddf-4e5b-90ed-bc4508f474bb', Text: 'Meeting' }, { Id: 'e5479599-a75d-4df8-8b06-7dd1ed82e563', Text: 'Agenda Item' }];
  getStatus(Id) {
    const val = this.typeList.find(x => x.Id == Id);
    return val.Text;
  }
  viewDetails(data) {
    var url: string = '';
    if (data.TypeID == 'e5479599-a75d-4df8-8b06-7dd1ed82e563') url = 'meetings/agenda/';
    else url = 'meetings/';
    this.proxy.Get(url + data.NotificationTypeID).subscribe(res => {
      console.log('data', res);
    });
  }
  ConvertTolocal(datestr) {
    // let yourDate = new Date(datestr);
    // console.log('MetingDatetiem', yourDate.toDateString());
    // console.log('TodayDatetiem', new Date().toDateString());
    // return yourDate.toDateString();
    return moment.utc(datestr).local().format('MM/DD/YYYY HH:mm:ss');
    //return formatDate(datestr, 'yyyy/MM/dd HH:MM', 'en');
  }
}
