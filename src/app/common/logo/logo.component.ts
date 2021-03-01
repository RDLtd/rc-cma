import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'rc-logo',
  templateUrl: './logo.component.html',
  styles: [
  ]
})
export class LogoComponent implements OnInit {

  @Input('brand') brandPrefix: string;
  @Input('height') logoHeight: string;

  constructor() { }

  ngOnInit(): void {
  }

}
