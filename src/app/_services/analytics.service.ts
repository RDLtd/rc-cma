import { Injectable } from '@angular/core';

@Injectable()
export class AnalyticsService {

  constructor() { }

  public sendEvent(cat, lbl, actn) {
    (<any>window).ga('send', 'event', {
      eventCategory: cat,
      eventLabel: lbl,
      eventAction: actn,
      eventValue: 10
    });
  }

}
