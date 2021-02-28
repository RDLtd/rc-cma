import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  headerTagSubject = new BehaviorSubject('Member\'s Hub');
  // Add delay to avoid the 'update after change detection error'
  currentHeaderTag = this.headerTagSubject.asObservable().pipe(delay(0));

  constructor() { }

  updateHeaderTag (str: string) {
    this.headerTagSubject.next(str)
  }

}
