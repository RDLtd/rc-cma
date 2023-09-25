import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventFormComponent } from './event-form.component';

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


export class CmsEventsComponent {
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

  constructor(
    private dialog: MatDialog,
  ) {
    this.events = [this.testEvent];
    this.events$ = of(this.events);
  }

  addEvent(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      event: {}
    };
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((obj) => {
      console.log(obj);
    });
  }

  editEvent(event: Event) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      event
    }
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((obj) => {
      console.log(obj);
    });
  }
  deleteEvent(): void {

  }
}
