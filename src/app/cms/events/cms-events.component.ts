import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EventFormComponent } from './event-form.component';
import { CmsLocalService } from '../cms-local.service';
import { Restaurant } from '../../_models';
import { EventService } from './event.service';

@Component({
  selector: 'rc-cms-events',
  templateUrl: './cms-events.component.html'
})

export class CmsEventsComponent implements OnInit {

  events$: Observable<any>;
  eventCategories: Observable<any>;
  restaurant: Restaurant;

  constructor(
    private dialog: MatDialog,
    private cmsLocal: CmsLocalService,
    private eventService: EventService
  ) {

  }

  ngOnInit() {
    // load available brand categories
    this.eventCategories = this.eventService.eventCategories;
    // console.log(this.eventCategories);
    // Subscribe to current Events (a.k.a. offers in our db)
    this.events$ = this.eventService.events;
    // Subscribe to currently selected restaurant
    this.cmsLocal.rest$.subscribe({
      next: (res) => {
        this.restaurant = res;
        this.eventService.fetchRestaurantEvents(this.restaurant.restaurant_number);
      },
      error: (err) => console.log(err)
    });
  }

  /**
   * initialise the Event form with an
   * empty object
   */
  addEvent(): void {
    const dialogConfig = {
      disableClose: true,
      data: {
        new: true,
        categories: this.eventCategories,
        formLabel: 'CREATE NEW EVENT',
        restaurant: this.restaurant,
        event: {}
      }
    };
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((event) => {
      console.log(event);
    });
  }

  /**
   * Edit existing Event/offer
   * @param event our session Event
   */
  editEvent(event: any) {
    const dialogConfig = {
      disableClose: true,
      data: {
        formLabel: 'EDITING EVENT',
        event: event,
        categories: this.eventCategories,
        restaurant: this.restaurant
      }
    }
    const dialogRef= this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((obj) => {
      // abort if nothing changed
      if (!obj) { return false; }

      // handle returned data
      switch (obj.action) {
        case 'update': {
          this.eventService.updateEvent(obj.data).subscribe({
            next: (res) => {
              // console.log(res);
              this.eventService.fetchRestaurantEvents(this.restaurant.restaurant_number);
            },
            error: (err) => console.error('Event update failed!', err)
          });
          break;
        }
        case 'delete': {
          // console.log(`Delete offer ${obj.data} from restaurant ${this.restaurant.restaurant_number}`)
          this.eventService.deleteEvent(obj.data, this.restaurant.restaurant_number);
          this.eventService.fetchRestaurantEvents(this.restaurant.restaurant_number);
          break;
        }
      }
      console.log(event);
    });
  }
}
