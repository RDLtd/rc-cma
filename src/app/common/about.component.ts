import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../app.config';

@Component({
  selector: 'rc-about',
  templateUrl: './about.component.html'
})

export class AboutComponent implements OnInit {

  build: any;
  os_text;
  company_logo_root;

  constructor(
    private config: AppConfig
  ) {}

  ngOnInit() {
    // show the OS and browser versions
    this.os_text = navigator.appVersion;
    this.company_logo_root = this.config.brand.logo;
  }
}
