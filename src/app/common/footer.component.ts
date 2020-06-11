import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../app.config';

@Component({
  selector: 'rc-footer',
  templateUrl: './footer.component.html'
})

export class FooterComponent implements OnInit {

  company_name;
  company_logo_root;
  company_url;


  constructor(
    private translate: TranslateService,
    private appConfig: AppConfig
  ) {}

  ngOnInit() {

    this.company_name = this.appConfig.brand.company_name;
    this.company_logo_root = this.appConfig.brand.logo;
    this.company_url = this.appConfig.brand.url;

  }

  setLanguage(lang) {
    localStorage.setItem('rd_language', lang);
    this.translate.use(lang);
  }
}
