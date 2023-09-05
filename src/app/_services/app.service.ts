import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private token = new BehaviorSubject(new HttpParams().set('Authorization', 'Bearer' +
    ' 234242423wdfsdvdsfsdrfg34tdfverge'));
  public authToken = this.token.asObservable();
  private currentAuthToken;

  brands: any;


  constructor(
    private config: AppConfig,
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.getBrandNames().subscribe({
      next: data => {
        this.brands = data.brands;
        console.log(data.brands);
      },
      error: (err) => {
        console.error(err)
      }
    });
  }

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

  getBrandNames(): Observable<any>  {
    return this.http.post(this.config.apiUrl + '/brand/getbrandnames',
      {
        userCode: this.config.userAPICode,
        token: this.token,
      });
  }

  get brand(): object {
    const prefix = localStorage.getItem('rd_brand');
    this.brands.forEach( item => {
      if (prefix === item.prefix) {
        return item;
      }
    });
    return null;
  }



}
