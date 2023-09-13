import { Component, Input } from '@angular/core';
import { Brand, ConfigService } from '../../init/config.service';
import { Observable } from 'rxjs';

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
  brand$: Observable<Brand>;

  constructor( private config: ConfigService ) {
    this.brand$ = this.config.brand;
  }

}
