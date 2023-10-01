import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EventFormComponent } from './event-form.component';
import { CmsLocalService } from '../cms-local.service';
import { Restaurant } from '../../_models';
import { EventService } from './event.service';
import { formatDate } from '@angular/common';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'rc-cms-events',
  templateUrl: './cms-events.component.html'
})

export class CmsEventsComponent implements OnInit {

  events$: Observable<any>;
  eventCategories: Observable<any>;
  restaurant: Restaurant;
  filteredEvents: any[];
  filter: string | null;
  eventsArray: any[];

  constructor(
    private dialog: MatDialog,
    private cmsLocal: CmsLocalService,
    private eventService: EventService,
    private translate: TranslateService
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
    this.events$.subscribe(arr => {
      this.eventsArray = arr;
      console.log('FilteredArray:', arr);
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
      if(!event) { return }
      this.dspMessage('New Event created!')
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
              this.dspMessage('Event successfully updated!');
            },
            error: (err) => console.error('Event update failed!', err)
          });
          break;
        }
        case 'delete': {
          // console.log(`Delete offer ${obj.data} from restaurant ${this.restaurant.restaurant_number}`)
          this.eventService.deleteEvent(obj.data, this.restaurant.restaurant_number);
          this.eventService.fetchRestaurantEvents(this.restaurant.restaurant_number);
          this.dspMessage('Event deleted!')
          break;
        }
      }
      console.log(event);
    });
  }

  active(event): boolean {
    // console.log(event);
    const now = formatDate(new Date(), 'yyy-MM-dd', 'en-GB');
    // console.log(now);
    if (now > event.offer_marketed_to) {
      return false;
    }
    return now >= event.offer_marketed_from;

  }

  dspMessage(msg: string): void {
    // this.translate.instant('CMS.IMAGES.msgDeleted', {img: img.cms_element_id})
    this.cmsLocal.dspSnackbar(
      msg, null, 3);
  }

  filterBy(type: any): void {
    this.clearFilters();
    switch(type) {
      case 'active': {
        this.filteredEvents = this.eventsArray.filter((item) => {
          return this.active(item);
        });
        this.filter = type;
        this.events$ = of(this.filteredEvents);
        break;
      }
      case 'inactive': {
        this.filteredEvents = this.eventsArray.filter((item) => {
          return !this.active(item);
        });
        this.filter = type;
        this.events$ = of(this.filteredEvents);
        break;
      }
      case 'category': {
        break;
      }
      default: {
        this.clearFilters();
        break;
      }
    }
  }
  clearFilters(): void {
    this.filter = null;
    this.events$ = of(this.eventsArray);
  }

}
