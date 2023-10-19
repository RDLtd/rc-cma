import { Component, OnInit } from '@angular/core';
import {ConfigService} from "../init/config.service";

@Component({
  selector: 'app-rc-about',
  templateUrl: './about.component.html'
})

export class AboutComponent implements OnInit {

  build: any;
  os_text;
  params: any;

  constructor(
    readonly config: ConfigService
  ) {
    this.params = {
      web: this.config.brand,
      year: new Date().getFullYear()
    };
  }

  ngOnInit() {
    // show the OS and browser versions
    this.os_text = navigator.userAgent;
  }
}
