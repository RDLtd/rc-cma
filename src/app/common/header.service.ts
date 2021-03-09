import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  // Init the subject
  sectionNameSubject = new BehaviorSubject('');

  // Add delay to avoid the 'update after change detection error'
  sectionName = this.sectionNameSubject.asObservable().pipe(delay(0));

  avatarSubject = new BehaviorSubject('');
  currentAvatar = this.avatarSubject.asObservable();

  lang: string;
  sectionNames = {
    en: {
      hub: "Member's Hub",
      profile: "Member Profile",
      market: "Marketplace",
      content: "Web Content Management"
    },
    fr: {
      hub: "Member's Hub",
      profile: "Member Profile",
      market: "Marketplace",
      content: "Web Content Management"
    }
  }

  constructor(
    private trans: TranslateService,
    private config: AppConfig ) {
    this.lang = localStorage.getItem('rd_language');
    this.trans.use(this.lang);
  }

  updateSectionName (str: string) {
    this.sectionNameSubject.next(this.sectionNames[this.lang][str])
  }

  updateAvatar(url: string) {
    this.avatarSubject.next(url);
  }

}
