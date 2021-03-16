import { Injectable } from '@angular/core';
import { AppService } from '../_services';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {

  private authToken: any;

  constructor(
    private app: AppService,
    private http: HttpClient,
    private config: AppConfig
  ) {
    this.app.authToken.subscribe(token => this.authToken = token);
  }

  getDeals(): any {
    return this.http.post(this.config.apiUrl + '/cms/getdeals',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }
}
