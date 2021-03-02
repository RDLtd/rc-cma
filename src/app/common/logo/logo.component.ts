import { Component, Input } from '@angular/core';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'rc-logo',
  templateUrl: './logo.component.html',
  styles: [
  ]
})
export class LogoComponent {

  @Input('height') logoHeight: number;
  @Input('class') logoClass: string;
  brand: string;

  constructor( private appConfig: AppConfig ) {
    this.brand = this.appConfig.brand.prefix;
  }

}
