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
    data: {
      image: string;
      icon: string;
      text: string;
    }
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
        categories: this.eventCategories,
        formLabel: 'CREATE NEW EVENT',
        restaurant: this.restaurant,
        event: {
          offer_category: {
            data: null
          }
        }
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
    dialogRef.afterClosed().subscribe((obj) => {
      if (!obj) { return false; }
      console.log(obj);
      switch (obj.action) {
        case 'update': {
          this.eventService.updateEvent(obj.data).subscribe({
            next: (res) => {
              console.log(res);
              this.eventService.fetchRestaurantEvents(this.restaurant.restaurant_number);
            },
            error: (e) => console.log(e)
          });
          break;
        }
        case 'delete': {
          console.log(`Delete offer ${obj.data} from restaurant ${this.restaurant.restaurant_number}`)
          //this.eventService.deleteEvent(obj.data, this.restaurant.restaurant_number);
          this.eventService.fetchRestaurantEvents(this.restaurant.restaurant_number);
          break;
        }
      }

      console.log(event);
    });
  }
  deleteEvent(id: number): void {

  }

}
