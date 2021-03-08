import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  sectionNameSubject = new BehaviorSubject('');
  // Add delay to avoid the 'update after change detection error'
  sectionName = this.sectionNameSubject.asObservable().pipe(delay(0));

  avatarSubject = new BehaviorSubject('');
  currentAvatar = this.avatarSubject.asObservable();

  lang: string;
  sectionNames = {
    en: {
      hub: "Members's Hub",
      profile: "Member Profile",
      market: "Marketplace"
    },
    fr: {
      hub: "Members's Hub",
      profile: "Member Profile",
      market: "Marketplace"
    }
  }

  constructor( private config: AppConfig ) {
    this.lang = localStorage.getItem('rd_language');
  }

  updateSectionName (str: string) {
    this.sectionNameSubject.next(this.sectionNames[this.lang][str])
  }

  updateAvatar(url: string) {
    this.avatarSubject.next(url);
  }

}
