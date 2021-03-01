import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  sectionNameSubject = new BehaviorSubject('Member\'s Hub');
  // Add delay to avoid the 'update after change detection error'
  sectionName = this.sectionNameSubject.asObservable().pipe(delay(0));

  avatarSubject = new BehaviorSubject('');
  currentAvatar = this.avatarSubject.asObservable();

  constructor() { }

  updateSectionName (str: string) {
    this.sectionNameSubject.next(str)
  }

  updateAvatar(url: string) {
    this.avatarSubject.next(url);
  }

}
