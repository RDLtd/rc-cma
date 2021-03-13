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

  constructor(
    private trans: TranslateService,
    private config: AppConfig ) {

  }

  updateSectionName (str: string) {
    this.sectionNameSubject.next(str);
  }

  updateAvatar(url: string) {
    this.avatarSubject.next(url);
  }

}
