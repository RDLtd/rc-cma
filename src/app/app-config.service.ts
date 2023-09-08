import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { AppConfig } from './app.config';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private token = new BehaviorSubject(new HttpParams().set('Authorization', 'Bearer' +
    ' 234242423wdfsdvdsfsdrfg34tdfverge'));
  public authToken = this.token.asObservable();
  private currentAuthToken;

  private brandObj;


  constructor(
    private config: AppConfig,
    private http: HttpClient
  ) {  }

  reportCriticalError(info) {
    this.authToken.subscribe( tkn => {
      this.currentAuthToken = tkn;
    });
    // send an email to support, logging a critical error in the application
    const msg = `## The CMA Application has recorded a Critical Error\n\n` +
      `${info}\n\n` +
      `Please refer to the transaction log for further information\n`;

    // Send critical stuff to RC support only
    // regardless of locale
    // NB this will not work, wrong field names in body...
    return this.http.post(this.config.apiUrl + '/members/sendemail',
      {
        companyName: 'RDL',
        companyPrefix: 'rc',
        emailTo: this.config.brand.email.support,
        emailFrom: this.config.brand.email.support,
        emailSubject: 'Critical Error',
        emailBody: msg,
        userCode: this.config.userAPICode,
        token: this.currentAuthToken
      });
  }

  getBrand(brand_prefix: string)  {
    return this.http.post(this.config.apiUrl + '/brand/getbrand',
      {
        userCode: this.config.userAPICode,
        token: this.token,
        brand_prefix,
        window_location_origin: this.config.appUrl,
        substitutions: true
      });
  }

  set brand(brand){
    console.log(`Brand set as ${brand['name']}`)
    this.brandObj = brand;
  }
  get brand(): object {
    return this.brandObj;
  }
  get brandName(): string {
    return this.brandObj.name;
  }

}
