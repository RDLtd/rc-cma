import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EventFormComponent } from './event-form.component';
import { CMSService } from '../../_services';
import { CmsLocalService } from '../cms-local.service';
import { Restaurant } from '../../_models';
import { EventService } from './event.service';

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
  events$: Observable<any>;
  eventCategories: Observable<any>;
  restaurant: Restaurant


  constructor(
    private dialog: MatDialog,
    private cms: CMSService,
    private cmsLocal: CmsLocalService,
    private eventService: EventService
  ) {

  }

  ngOnInit() {
    this.eventCategories = this.eventService.eventCategories;
    console.log(this.eventCategories);
    this.events$ = this.eventService.events;
    this.cmsLocal.rest$.subscribe({
        next: (res) => {
          this.restaurant = res;
          this.eventService.fetchRestaurantEvents(this.restaurant.restaurant_number);
        },
        error: (err) => console.log(err)
    });
  }

  addEvent(): void {
    let dialogConfig;
    dialogConfig = {
      disableClose: true,
      data: {
        formLabel: 'CREATE NEW EVENT',
        event: {},
        categories: this.eventCategories,
        restaurant: this.restaurant
      }
    };
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((event) => {
      console.log(event);
    });
  }

  editEvent(event: any) {
    let dialogConfig;
    dialogConfig = {
      disableClose: true,
      data: {
        formLabel: 'EDITING EVENT',
        event: event,
        categories: this.eventCategories,
        restaurant: this.restaurant
      }
    }
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((event) => {
      if (!event) { return false; }
      this.eventService.updateEvent(event).subscribe({
        next: (res) => {
          console.log(res);
          this.eventService.fetchRestaurantEvents(this.restaurant.restaurant_number);
        }
      });
      console.log(event);
    });
  }
  deleteEvent(): void {

  }

}
