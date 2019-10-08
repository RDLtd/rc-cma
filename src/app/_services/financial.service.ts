import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { AppConfig } from '../app.config';
import { Financial } from '../_models/financial';
import { map } from 'rxjs/operators';

@Injectable()

export class FinancialService {

  constructor(private http: Http, private config: AppConfig) { }

  getAll() {
    return this.http.post(this.config.apiUrl + '/financials',
      { userCode: this.config.userAPICode, token: this.jwt() }).pipe(map((response: any) => response.json()));
  }

  getForRestaurant(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/financials/forrestaurant',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() }).pipe(map((response: any) => response.json()));
  }

  create(financial: Financial) {
    return this.http.post(this.config.apiUrl + '/financials/create',
      { financial: financial, userCode: this.config.userAPICode, token: this.jwt() }).pipe(map((response: any) => response.json()));
  }

  update(financial: Financial) {
    return this.http.post(this.config.apiUrl + '/financials/update',
      { financial: financial, userCode: this.config.userAPICode, token: this.jwt() }).pipe(map((response: any) => response.json()));
  }

  _delete(financial_id: string) {
    return this.http.post(this.config.apiUrl + '/financials/delete',
      { financial_id: financial_id, userCode: this.config.userAPICode, token: this.jwt() }).pipe(map((response: any) => response.json()));
  }


  // generate token
  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      const headers = new Headers({
        'Authorization': 'Bearer ' + currentUser.token,
        'apiCategory': 'Financial'
      });
      return new RequestOptions({ headers: headers });
    } else {
      // if there is no user, then we must invent a token
      const headers = new Headers({
        'Authorization': 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge',
        'apiCategory': 'Financial'
      });
      return new RequestOptions({ headers: headers });
    }
  }
}

