import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EventFormComponent } from './event-form.component';
import { CMSService } from '../../_services';

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
  dateRange: {
    start: string;
    end: string;
  }
  marketingRange: {
    start: string;
    end: string
  }
  active: boolean;
}

@Component({
  selector: 'rc-cms-events',
  templateUrl: './cms-events.component.html'
})


export class CmsEventsComponent implements OnInit {
  events: [Event];
  testEvent = {
    category: {
      key: 'event',
      name: 'Event'
    },
    title: 'Rugby World Cup 2023',
    subTitle: 'Starts on the 8th September',
    description: 'Are you a rugby enthusiast? Do you love cheering for your favorite teams with a great crowd? Look no ' +
      'further! **Fullers** is your ultimate destination to witness all the thrilling moments of the **2023 Rugby World Cup**!' +
      'Watch Every Game LIVE in our bar area',
    imgPath: '',
    icon: '',
    link: '#external-link',
    dateRange: {
      start: '',
      end: ''
    },
    marketingRange: {
      start: '',
      end: '',
    },
    active: true
  }

  events$: Observable<Event[]>;
  eventCategories: Observable<any>;

  constructor(
    private dialog: MatDialog,
    private cms: CMSService
  ) {

  }

  ngOnInit() {
    this.events = [this.testEvent];
    this.events$ = of(this.events);
    this.eventCategories = this.cms.eventCategories;
    console.log(this.eventCategories);
  }

  addEvent(): void {
    let dialogConfig;
    dialogConfig = {
      data: {
        event: {},
        categories: this.eventCategories
      }
    };
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((obj) => {
      console.log(obj);
    });
  }

  editEvent(event: Event) {
    let dialogConfig;
    dialogConfig = {
      disableClose: true,
      data: {
        event,
        categories: this.eventCategories
      }
    }
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((obj) => {
      console.log(obj);
    });
  }
  deleteEvent(): void {

  }
}
