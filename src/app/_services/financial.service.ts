import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Financial } from '../_models';
import { AppService } from './app.service';


@Injectable()

export class FinancialService {

  authToken;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    private config: AppConfig) {
    this.appService.authToken.subscribe(token => this.authToken = token);
  }

  getAll() {
    return this.http.post(this.config.apiUrl + '/financials',
      { userCode: this.config.userAPICode, token: this.authToken });
  }

  getForRestaurant(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/financials/forrestaurant',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.authToken });
  }

  create(financial: Financial) {
    return this.http.post(this.config.apiUrl + '/financials/create',
      { financial: financial, userCode: this.config.userAPICode, token: this.authToken });
  }

  update(financial: Financial) {
    return this.http.post(this.config.apiUrl + '/financials/update',
      { financial: financial, userCode: this.config.userAPICode, token: this.authToken });
  }

  _delete(financial_id: string) {
    return this.http.post(this.config.apiUrl + '/financials/delete',
      {
        financial_id: financial_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }
}

