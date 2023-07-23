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

  createBpi(bpi: Object, version: number) {
    console.log('createBpiAccount', bpi, version);
    return this.http.post(this.config.apiUrl + '/bpi/createbpi',
      {
        bpi,
        version,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }
}
