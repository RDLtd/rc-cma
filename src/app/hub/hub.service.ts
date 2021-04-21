import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { AppService } from '../_services';


@Injectable({
  providedIn: 'root'
})
export class HubService {

  private authToken: any;

  constructor(
    private app: AppService,
    private http: HttpClient,
    private config: AppConfig
  ) {
    this.app.authToken.subscribe(token => this.authToken = token);
  }

  getServices(): any {
    return this.http.post(this.config.apiUrl + '/cms/getservices',
      {
        company: this.config.brand.prefix,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  // Set the authenticated flag to true
  // i.e. the member has seen the welcome messages
  updateMemberAuth(member) {
    // console.log(member);
    localStorage.setItem('rd_profile', JSON.stringify(member));
    return this.http.post(this.config.apiUrl + '/members/setauthenticated',
      {
        member_id: member.member_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }


}
