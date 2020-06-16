import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { User } from '../models/User';

@Injectable()
export class DataService {

  private dataSource = new BehaviorSubject(new Array<User>());
  data = this.dataSource.asObservable();

  constructor() { }

  updatedDataSelection(data: Array<User>) {
    this.dataSource.next(data);
  }
}