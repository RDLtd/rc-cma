import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  // Init the subject
  sectionNameSubject = new BehaviorSubject('');

  // Add a delay to avoid the 'update after change detection error'
  sectionName = this.sectionNameSubject.asObservable().pipe(delay(0));

  avatarSubject = new BehaviorSubject('');
  currentAvatar = this.avatarSubject.asObservable();

  lang: string;

  constructor() {

  }

  updateSectionName (str: string) {
    this.sectionNameSubject.next(str);
  }

  updateAvatar(url: string) {
    this.avatarSubject.next(url);
  }

}
