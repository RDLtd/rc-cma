import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  // App values
  public readonly apiUrl = environment.API_URL;
  public readonly appUrl = window.location.origin;
  public readonly userAPICode = 'RDL-dev';

  // Auth token
  private token = new BehaviorSubject(new HttpParams().set('Authorization', 'Bearer' +
    ' 234242423wdfsdvdsfsdrfg34tdfverge'));
  public authToken = this.token.asObservable();

  // Brand Observable
  private brandConfig = new BehaviorSubject<any>(null);
  public readonly brand$ = this.brandConfig.asObservable().pipe(
    // Ignore null
    filter (brandConfig => !!brandConfig)
  )

  public readonly languages = ['en', 'fr'];

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) { }

  getBrandConfig() {
    this.http.post(this.apiUrl + '/brand/getbrand',
      {
        userCode: this.userAPICode,
        token: this.token,
        brand_prefix: localStorage.getItem('rd_brand') ?? 'app',
        window_location_origin: this.appUrl,
        substitutions: true
      })
      .subscribe({
        next: (brand) => this.brandConfig.next(brand),
        error: () => console.log('Error loading brand')
      })
  }

  setLanguage() {
    // console.log(`Translation loaded (${lang})`, languages.includes(lang));
    this.translate.addLangs(this.languages);
    let lang = localStorage.getItem('rd_language');
    // If the user language is not supported, default to en
    if (!this.languages.includes(lang)) { lang = this.languages[0]; }
    this.translate.setDefaultLang(lang);
    return this.translate.use(lang)
      .subscribe({
        next: ((res) => console.log(res)),
        error: () => console.log('setLanguage error')
    });
  }
}
