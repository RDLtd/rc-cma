import { Component, Input } from '@angular/core';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'app-rc-logo',
  templateUrl: './logo.component.html'
})

export class LogoComponent {
  // Default height
  @Input() height = '100%';
  // Added class that provides style
  // e.g. 'primary' or 'accent'
  @Input() version = 'white';
  brand: string;

  constructor( private appConfig: AppConfig ) {
    this.brand = this.appConfig.brand.prefix;
  }

}
