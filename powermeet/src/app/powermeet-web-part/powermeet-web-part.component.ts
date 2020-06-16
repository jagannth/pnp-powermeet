import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-powermeet-web-part',
  templateUrl: './powermeet-web-part.component.html',
  styleUrls: ['./powermeet-web-part.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PowermeetWebPartComponent implements OnInit {
  @Input() description: string;

  constructor() { }

  ngOnInit() {
  }

}
