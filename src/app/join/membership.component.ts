import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { loadStripe } from '@stripe/stripe-js/pure';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MemberService } from '../_services';
import { CurrencyPipe } from '@angular/common';
import { LoadService } from '../common';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceId: string;
  taxId: string;
  active: boolean;
  category: string;
}

@Component({
  selector: 'rc-membership',
  templateUrl: './membership.component.html'
})
export class MembershipComponent implements OnInit {

  transParams: any;
  waiting = false;
  stripeSessionId: string;
  stripePromise: any;
  stringInCode: any;
  products = [];
  mdProdMonthly: string;
  mdProdYearly: string;

  constructor(
    private config: AppConfig,
    private http: HttpClient,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private memberService: MemberService,
    private currencyPipe: CurrencyPipe,
    private snack: MatSnackBar
  ) {

    this.stripePromise = loadStripe(environment[this.config.brand.prefix + '_stripe_key']);

    this.transParams = {
      brand: this.config.brand.name,
      terms: this.config.brand.downloads.terms,
      privacy: this.config.brand.downloads.privacy
    }
  }

  ngOnInit(): void {
   // this.getTranslations();
    this.route.queryParams.subscribe(params => {
      this.stripeSessionId = params['session_id'];
      // console.log('stripeSessionId', this.stripeSessionId);
    });
    //this.loader.open();
    this.getProducts().then(() => console.log('loaded'));
  }

  async getProducts() {
    await this.memberService.getProductsMaxRestaurants(1)
      .toPromise()
      .then(res => {
        this.products = res['products'];
        console.log(this.products);
        this.mdProdMonthly = this.translate.instant(
          'MEMBERSHIP.infoMembershipMonthly',
          {
            fee: this.currencyPipe.transform(this.products[0].product_price, this.config.brand.currency.code),
            brand: this.transParams.brand
          });
        this.mdProdYearly = this.translate.instant(
          'MEMBERSHIP.infoMembershipYearly',
          {
            fee: this.currencyPipe.transform(this.products[1].product_price, this.config.brand.currency.code),
            brand: this.transParams.brand
          });
      });
  }

  // Create Stripe Session
  async createCheckoutSession(options) {
    return this.http.post(`${this.config.apiUrl}/payments/create-session`, options)
      .toPromise()
      .catch(reason => {
        console.log('FAILED', reason);
        this.snack.open(this.translate.instant('MEMBERSHIP.msgInvalidStripe', { email: this.config.brand.email.support }), 'Ok', {
          duration: 15000,
          verticalPosition: 'top'
        });
        //this.waiting = false;
      });
  };

  async checkout(product)  {
    const newMember = JSON.parse(sessionStorage.getItem('rc_member_pending'));
    this.waiting = true;
    await this.createCheckoutSession({
      priceId: this.products[product].product_stripe_price_id,
      taxId: this.products[product].product_tax_id,
      successUrl: this.config.brand.products.success_url,
      cancelUrl: this.config.brand.products.cancel_url,
      email: newMember.email,
      company: this.config.brand.prefix
    })
      .then(data => {
        console.log('MC Session', data)
        this.stripeSessionId = data['sessionId'];
      });
    const stripe = await this.stripePromise;
    const { error } = await stripe.redirectToCheckout(
      {
        sessionId: this.stripeSessionId
      }
    );
    if (error) {
      console.log('Error', error);
      this.snack.open(this.translate.instant('MEMBERSHIP.msgInvalidStripe', { email: this.config.brand.email.support }), 'Ok', {
        duration: 15000,
        verticalPosition: 'top'
      });
    }
  }

}
