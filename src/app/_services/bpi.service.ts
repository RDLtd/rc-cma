import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppService } from './app.service';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class BpiService {

  authToken: HttpParams;
  constructor(
    private http: HttpClient,
    private appService: AppService,
    private config: AppConfig) {
    this.appService.authToken.subscribe(token => this.authToken = token);
  }

  createBpiAccount(bpi: Object) {
    console.log('createBpiAccount', bpi);
    return this.http.post(this.config.apiUrl + '/bpi/createbpi',
      {
        bpi,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }
}
