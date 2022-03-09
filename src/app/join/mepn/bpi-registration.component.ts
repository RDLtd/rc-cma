import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {BpiService, MemberService} from '../../_services';

@Component({
  selector: 'app-bpi-registration',
  templateUrl: './bpi-registration.component.html'
})
export class BpiRegistrationComponent implements OnInit {

  referralCode: string;
  formBpi: FormGroup;
  totalEmployees: [string];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private memberService: MemberService,
    private bpiService: BpiService
  ) {
    if (this.route.snapshot.params.code) {
      this.referralCode = this.route.snapshot.params.code;
    }
    this.totalEmployees = this.translate.instant('BPI.listTotalEmployees');
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.formBpi = this.fb.group({
      bpi_company_name: ['', Validators.required],
      bpi_company_address:  ['', Validators.required],
      bpi_company_town:  ['', Validators.required],
      bpi_company_post_code:  ['', Validators.required],
      bpi_siret:  ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      bpi_company_employees: ['', Validators.required],
      bpi_director_forename:  ['', Validators.required],
      bpi_director_surname:  ['', Validators.required],
      bpi_director_email:  ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Retrieve memberId
   */
  startBpiRegistration(): void {}

}
