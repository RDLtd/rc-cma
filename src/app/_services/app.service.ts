import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private token = new BehaviorSubject(new HttpParams().set('Authorization', 'Bearer' +
    ' 234242423wdfsdvdsfsdrfg34tdfverge'));
  public authToken = this.token.asObservable();

  constructor() {}
}
