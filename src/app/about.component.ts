import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'rc-about',
  templateUrl: './about.component.html'
})

export class AboutComponent implements OnInit {

  build: any;
  os_text;
  company_logo_root;

  constructor() {}

  ngOnInit() {
    // show the OS and browser versions
    this.os_text = navigator.appVersion;
    this.company_logo_root = localStorage.getItem('rd_company_logo_root');
  }
}
