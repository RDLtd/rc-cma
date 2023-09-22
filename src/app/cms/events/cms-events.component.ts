import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Event {
  category: {
    key: string,
    name: string
  };
  title: string;
  subTitle: string;
  description: string;
  link?: string;
  imgPath: string;
  icon: string;
  datesActive: {
    start: string;
    end: string;
  }
  datesMarketed: {
    start: string;
    end: string
  }
  active: boolean;

}

@Component({
  selector: 'rc-cms-events',
  templateUrl: './cms-events.component.html'
})


export class CmsEventsComponent {
  events: [Event];
  testEvent = {
    category: {
      key: 'event',
      name: 'Event'
    },
    title: 'Rugby World Cup 2023',
    subTitle: 'Starts on the 8th September',
    description: 'Catch all the action from this year\'s **Rugby World Cup** across various dates from 8th September to ' +
      '28th October. Games will be shown in the garden if good weather',
    imgPath: '',
    icon: '',
    link: '#external-link',
    datesActive: {
      start: '',
      end: ''
    },
    datesMarketed: {
      start: '',
      end: '',
    },
    active: true
  }

  events$: Observable<Event[]>;

  constructor() {
    this.events = [this.testEvent];
    this.events$ = of(this.events);
  }

  editEvent(event: Event) {
    console.log(event);
  }
}
