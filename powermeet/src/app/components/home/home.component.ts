import { Component, OnInit , Input} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  meetingsList: any = [];
  auth: boolean = false;

  constructor(public spinner: NgxSpinnerService, private router: Router) { }

  ngOnInit(): void {
    const val = sessionStorage.getItem('user');
    if (!val) {
      this.router.navigate(['/Login']);
    }
  }
}
