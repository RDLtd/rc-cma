import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { loadStripe } from '@stripe/stripe-js/pure';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService, MemberService } from '../_services';
import { CurrencyPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmCancelComponent } from '../common';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceId: string;
  taxId: any;
  active: boolean;
  category: string;
}

@Component({
  selector: 'app-rc-membership',
  templateUrl: './membership.component.html'
})
export class MembershipComponent implements OnInit {

  transParams: any;
  waiting = false;
  pending: any;
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
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private error: ErrorService
  ) {

    this.stripePromise = loadStripe(environment[this.config.brand.prefix + '_stripe_key']);

    this.transParams = {
      brand: this.config.brand.name,
      terms: this.config.brand.downloads.terms,
      privacy: this.config.brand.downloads.privacy
    };
  }

  ngOnInit(): void {
   // this.getTranslations();
    this.route.queryParams.subscribe(params => {
      this.stripeSessionId = params['session_id'];
      // console.log('stripeSessionId', this.stripeSessionId);
    });
    // this.loader.open();
    this.getProducts()
      .then(() => console.log('loaded'))
      .catch(err => {
        console.log(err);
        // the user does not need to see this error!
        this.error.handleError('', 'Unable to get products in membership component ngOnInit! ' + err);
      });

    // If this was a sales referral and
    // there is a promotion message then display it
    this.pending = JSON.parse(sessionStorage.getItem('app_member_pending'));
    console.log(this.pending);
    if (!!this.pending.promo_status) {
      this.dialog.open(ConfirmCancelComponent, {
        data: {
          title: 'Welcome',
          body: this.pending.promo_status,
          cancel: 'hide',
          confirm: 'OK'
        }
      });
    }
  }

  async getProducts() {
    // ks apptiser update - set max_restaurants to 3 to get the app products
    // NB for now assume that the products are returned first setup, then monthly fee
    await lastValueFrom(this.memberService.getProductsMaxRestaurants(3))
      .then(res => {
        this.products = res['products'];
        console.log(this.products);
        this.mdProdMonthly = this.translate.instant(
          'MEMBERSHIP.infoMembershipMonthly',
          {
            fee: this.currencyPipe.transform(this.products[1].product_price, this.config.brand.currency.code),
            brand: this.transParams.brand
          });
        // this.mdProdYearly = this.translate.instant(
        //   'MEMBERSHIP.infoMembershipYearly',
        //   {
        //     fee: this.currencyPipe.transform(this.products[1].product_price, this.config.brand.currency.code),
        //     brand: this.transParams.brand
        //   });
      })
      .catch(err => {
        console.log(err);
        // the user does not need to see this error!
        this.error.handleError('', 'Unable to get products in membership component! ' + err);
      });
  }

  // Create Stripe Session
  async createCheckoutSession(options) {
    console.log('Session options', options);
    return lastValueFrom(this.http.post(`${this.config.apiUrl}/payments/create-session`, options))
      .catch(reason => {
        console.log('FAILED', reason);
        // don't show error as this is handled locally
        this.error.handleError('', 'Unable to create stripe session! ' + reason);
        this.snack.open(this.translate.instant('MEMBERSHIP.msgInvalidStripe', { email: this.config.brand.email.support }), 'Ok', {
          duration: 15000,
          verticalPosition: 'top'
        });
        // this.waiting = false;
      });
  }

  async checkout(product)  {
    const newMember = JSON.parse(sessionStorage.getItem('app_member_pending'));
    this.waiting = true;
    // need also to send the setup fee if this is a first time app purchase - if we
    // got here via the membership component then that is true
    let priceId = '';
    let setupPriceId = '';
    if (this.config.brand.prefix === 'app' ) {
      priceId = this.products[1].product_stripe_price_id;
      setupPriceId = this.products[0].product_stripe_price_id;
    } else {
      priceId = this.products[product].product_stripe_price_id;
    }
    await this.createCheckoutSession({
      priceId: priceId,
      // Allow for tax to be optional
      taxId: !!this.products[product].product_tax_id ? [this.products[product].product_tax_id] : [],
      successUrl: this.config.brand.products.success_url,
      cancelUrl: this.config.brand.products.cancel_url,
      email: newMember.email,
      company: this.config.brand.prefix,
      setupPriceId: setupPriceId
    })
      .then(data => {
        console.log('MC Session', data);
        this.stripeSessionId = data['sessionId'];
      })
      .catch(err => {
        console.log(err);
        // the user does not need to see this error!
        this.error.handleError('', 'Unable to create checkout session in checkout function! ' + err);
      });
    const stripe = await this.stripePromise;
    const { error } = await stripe.redirectToCheckout(
      {
        sessionId: this.stripeSessionId
      }
    );
    if (error) {
      console.log('Error', error);
      // don't show error as this is handled locally
      this.error.handleError('', 'Unable to redirect to stripe! ' + error);
      this.snack.open(this.translate.instant('MEMBERSHIP.msgInvalidStripe', { email: this.config.brand.email.support }), 'Ok', {
        duration: 15000,
        verticalPosition: 'top'
      });
    }
  }
}
