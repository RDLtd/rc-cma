import { Injectable } from '@angular/core';
import { Brand, ConfigService } from '../../init/config.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CmsLocalService } from '../cms-local.service';
import { StorageService } from '../../_services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  eventCatSub = new BehaviorSubject<any>(null);
  eventCat$ = this.eventCatSub.asObservable().pipe(
    filter (cat => !!cat),
    //map(categories => categories?.offer_categories)
  );
  eventsSub = new BehaviorSubject<any>([]);
  events$ = this.eventsSub.asObservable().pipe(
    map( events => events?.offers)
  );
  arrCategories: any[];
  brand: Brand;
  user: any;
  constructor(
    private config: ConfigService,
    private http: HttpClient,
    private cms: CmsLocalService,
    private storage: StorageService
  ) {
    // Load brand configuration
    this.config.brand$.subscribe({
      next: (brand) => this.brand = brand
    });
    // Load events and event categories
    this.getEventCategories();
    this.user = storage.get('rd_profile');
  }

  getEventCategories(): void {

    this.http.post(this.config.apiUrl + '/offers/getoffercategories',
      {
        userCode: this.config.userAPICode,
        token: this.config.token,
        brand: this.brand.prefix,
        restaurant_number: this.cms.restaurantNumber
      }).subscribe({
      next: (categories) => {
        const cats = this.catsRestructured(categories['offer_categories']);
        this.arrCategories = cats;
        this.eventCatSub.next(cats);
      }
    });
  }

  getEventsArr(): any {
    return this.arrCategories;
  }

  catsRestructured(categories): any[] {
    const cats = [];
    categories.forEach((cat) => {
      let obj = {
        id: cat.key,
        label: cat.data.text,
        image: cat.data.image,
        icon: cat.data.icon
      }
      cats.push(obj);
    });
    return cats;
  }

  get eventCategories(): Observable<any> {
    return this.eventCat$;
  }

  fetchRestaurantEvents(restaurant_number: string): void {
      this.http.post(this.config.apiUrl + '/offers/getoffersbyrestaurant',
          {
              company: this.brand.prefix,
              userCode: this.config.userAPICode,
              token: this.config.token,
              restaurant_number
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

  deleteEvent(offer_id: number, restNumber: string): void {
    this.http.post(this.config.apiUrl + '/offers/deleteoffer',
      {
        offer_id,
        userCode: this.config.userAPICode,
        token: this.config.token
      }).subscribe({
      next: (res) => {
        console.log(res);
        this.fetchRestaurantEvents(restNumber);
      }
    });
  }

  createEvent(offer): Observable<any> {
    console.log(offer);
    return this.http.post(this.config.apiUrl + '/offers/addoffer',
      {
        offer,
        userCode: this.config.userAPICode,
        token: this.config.token
      });
  }

  subscribeToEvent(offer_id, restNum: string): Observable<any> {

    console.log(offer_id, restNum, this.user.member_id);

    return this.http.post(this.config.apiUrl + '/offers/addrestauranttooffer',
      {
        offer_id,
        restaurant_number: restNum,
        member_id: this.user.member_id,
        userCode: this.config.userAPICode,
        token: this.config.token
      });

  }


}
