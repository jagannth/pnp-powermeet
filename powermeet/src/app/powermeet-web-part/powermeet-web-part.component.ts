import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-powermeet-web-part',
  templateUrl: './powermeet-web-part.component.html',
  styleUrls: ['./powermeet-web-part.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PowermeetWebPartComponent implements OnInit {
  @Input() description: any;
  @Input() user: any;

  constructor() { }

  ngOnInit() {
    console.log('descritption',this.description);
    console.log('user',this.user);
  }
  ngAfterViewInit() {
    sessionStorage.setItem('authconfig', this.description);
    sessionStorage.setItem('user', this.user);
    (<HTMLAnchorElement>document.getElementById('dashboard')).click();
    console.log('adal token view',sessionStorage.getItem('adal.access.token.keyhttps://graph.microsoft.com'));
  }

}
