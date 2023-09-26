import { Injectable } from '@angular/core';
import { Brand, ConfigService } from '../../init/config.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  eventCatSub = new BehaviorSubject<any>(null);
  eventCat$ = this.eventCatSub.asObservable().pipe(
    filter (cat => !!cat),
    map(categories => categories?.offer_categories)
  );
  eventsSub = new BehaviorSubject<any>([]);
  events$ = this.eventsSub.asObservable().pipe(
    map( events => events?.offers)
  );

  brand: Brand;
  constructor(
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.config.brand$.subscribe({
      next: (brand) => this.brand = brand
    });
    this.getEventCategories();
    this.getEvents();
  }

  getEventCategories(): void {
    this.http.post(this.config.apiUrl + '/offers/getoffercategories',
      {
        userCode: this.config.userAPICode,
        token: this.config.token,
        brand: this.brand.prefix
      }).subscribe({
      next: (categories) => {
        console.log(categories);
        this.eventCatSub.next(categories);
      }
    });
  }
  get eventCategories(): Observable<any> {
    return this.eventCat$;
  }

  getEvents(): void {
    this.http.post(this.config.apiUrl + '/offers/getoffers',
      {
        company: this.brand.prefix,
        userCode: this.config.userAPICode,
        token: this.config.token
      }).subscribe({

      next: (events) => {
        console.log(events);
        this.eventsSub.next(events);
      }
    });
  }

  get events(): Observable<any> {
    return this.events$
  }

  // set event(event) {
  //   this.eventCatSub.next(event);
  // }

  updateEvent(offer): Observable<any> {
    return this.http.post(this.config.apiUrl + '/offers/updateoffer',
      {
        offer,
        userCode: this.config.userAPICode,
        token: this.config.token
      });
  }

  deleteEvent(): void {

  }

  createEvent(): void {

  }


}
