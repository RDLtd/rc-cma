﻿import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Financial } from '../_models';


@Injectable()

export class FinancialService {

  constructor(private http: HttpClient, private config: AppConfig) { }

  getAll() {
    return this.http.post(this.config.apiUrl + '/financials',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getForRestaurant(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/financials/forrestaurant',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  create(financial: Financial) {
    return this.http.post(this.config.apiUrl + '/financials/create',
      { financial: financial, userCode: this.config.userAPICode, token: this.jwt() });
  }

  update(financial: Financial) {
    return this.http.post(this.config.apiUrl + '/financials/update',
      { financial: financial, userCode: this.config.userAPICode, token: this.jwt() });
  }

  _delete(financial_id: string) {
    return this.http.post(this.config.apiUrl + '/financials/delete',
      { financial_id: financial_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  // generate token
  private jwt() {

    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const requestOptions = {
      params: new HttpParams()
    };
    requestOptions.params.set('foo', 'bar');
    requestOptions.params.set('apiCategory', 'Financial');

    //this.http.get(environment.api+ '.feed.json', requestOptions );

    if (currentUser && currentUser.token) {
      // const headers = new Headers({
      //   'Authorization': 'Bearer ' + currentUser.token,
      //   'apiCategory': 'Financial'
      // });
     // return new RequestOptions({ headers: headers });
      requestOptions.params.set('Authorization', 'Bearer ' + currentUser.token);
    } else {
      // if there is no user, then we must invent a token
      // const headers = new Headers({
      //   'Authorization': 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge',
      //   'apiCategory': 'Financial'
      // });
     // return new RequestOptions({ headers: headers });
      requestOptions.params.set('Authorization', 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge');
    }
    return requestOptions;
  }
}

