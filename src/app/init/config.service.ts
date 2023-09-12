import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

declare const require: any;

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  // App values
  readonly API_URL = environment.API_URL;
  readonly mozId = environment.MOZ_ID;
  readonly appUrl = window.location.origin;
  readonly userAPICode = 'RDL-dev';
  readonly upload_preset = 'nozxac7z';
  // session limits
  readonly timeout = 60; // minutes
  readonly countdown = 5; // minutes to check activity before timeout
  readonly airBrake = false;
  readonly buildObj = {
    version: require('../../../package.json').version,
    name: require('../../../package.json').name
  };

  // Auth token
  private tokenSubject = new BehaviorSubject(new HttpParams().set('Authorization', 'Bearer' +
    ' 234242423wdfsdvdsfsdrfg34tdfverge'));
  readonly authToken = this.tokenSubject.asObservable();

  // Brand Observable
  private brandConfig = new BehaviorSubject<any>(null);
  readonly brand$ = this.brandConfig.asObservable().pipe(
    // Ignore null
    filter (brandConfig => !!brandConfig),
    map(brandConfig => brandConfig?.brand)
  )

  public readonly languages = ['en', 'fr'];

  public readonly sql_defaults = {
    where_field: 'restaurant_name',
    where_string: '',
    where_any_position: 'N',
    sort_field: 'restaurant_id',
    sort_direction: 'ASC',
    limit_number: '30',
    limit_index: '0'
  };

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) { }

  getBrandConfig(): any {
    // load brand from backend
    this.http.post(this.apiUrl + '/brand/getbrand',
      {
        userCode: this.userAPICode,
        token: this.authToken,
        brand_prefix: localStorage.getItem('rd_brand') ?? 'app',
        window_location_origin: this.appUrl,
        substitutions: true
      })
      .subscribe({
        next: (brand) => {
          // notify subscribers
          this.brandConfig.next(brand);
          return brand;
        },
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
    return this.translate.use(lang).subscribe();
  }

  displayConfig(): void {
    this.brand$.subscribe((brand) => {
      console.log(`Brand: ${brand.name}`);
      console.log(brand);
    });
    console.log(`API: ${this.apiUrl}`);
    console.log(`Language: ${this.languages}`);
    console.log(`Locale: ${localStorage.getItem('rd_locale')}`);

    // console.log(`Session length: ${this.timeout} mins`);
    // console.log(`Session countdown from : ${this.countdown} min.`);
  }

  get brand() {
    return this.brand$;
  }

  get brandObj() {
    return this.brand$.subscribe((obj) => {
      return obj;
    })
  }

  get token() {
    return this.authToken;
  }

  get build() {
    return this.buildObj;
  }

  get session_timeout() {
    return this.timeout;
  }
  get session_countdown() {
    return this.countdown;
  }

  get useAirBrake() {
    return this.airBrake;
  }

  get apiUrl() {
    return this.API_URL
  }
}
