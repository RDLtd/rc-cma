import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../app.config';

@Component({
  selector: 'app-rc-about',
  templateUrl: './about.component.html'
})

export class AboutComponent implements OnInit {

  build: any;
  os_text;
  params: any;

  constructor(
    private config: AppConfig
  ) {
    this.params = {
      web: this.config.brand.url,
      year: new Date().getFullYear()
    };
  }

  ngOnInit() {
    // show the OS and browser versions
    this.os_text = navigator.userAgent;
  }
}
