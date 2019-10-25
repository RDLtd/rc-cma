import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-footer',
  templateUrl: './footer.component.html'
})

export class FooterComponent implements OnInit {

  company_name;
  company_logo_root;
  company_url;

  constructor( private translate: TranslateService) {}

  ngOnInit() {
    this.company_name = localStorage.getItem('rd_company_name');
    this.company_logo_root = localStorage.getItem('rd_company_logo_root');
    this.company_url = localStorage.getItem('rd_company_url');
  }

  setLanguage(lang) {
    this.translate.use(lang);
    localStorage.setItem('rd_country', lang);
  }
}
