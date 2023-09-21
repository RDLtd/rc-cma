import { Component } from '@angular/core';

export interface Event {
  category: string;
  title: string;
  subTitle: string;
  imgPath: string;
  icon: string;
  date: {
    start: Date;
    end: Date;
  }
  marketing: {
    start: Date;
    end: Date
  }
  active: boolean;

}

@Component({
  selector: 'rc-cms-events',
  templateUrl: './cms-events.component.html',
  styles: [
  ]
})


export class CmsEventsComponent {
  events: Event[];

  constructor() {
  }
}
