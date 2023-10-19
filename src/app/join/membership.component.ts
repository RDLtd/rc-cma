import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js/pure';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService, MemberService } from '../_services';
import { CurrencyPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmCancelComponent } from '../common';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom, Observable } from 'rxjs';
import { Brand, ConfigService } from '../init/config.service';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceId: string;
  taxId: any;
  active: boolean;
  category: string;
  brand$: Observable<Brand>;
}

@Component({
  selector: 'app-rc-membership',
  templateUrl: './membership.component.html'
})
export class MembershipComponent implements OnInit {

  brand: Brand;
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
    private config: ConfigService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private memberService: MemberService,
    private currencyPipe: CurrencyPipe,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private error: ErrorService
  ) {

    config.brand.subscribe(obj => this.brand = obj);
    try {
      this.stripePromise = loadStripe(environment[this.brand.prefix + '_stripe_key']);
      console.log(this.stripePromise);
    } catch (err) {
      console.log(err);
    }

    this.transParams = {
      brand: this.brand.name,
      terms: this.brand.downloads.terms,
      privacy: this.brand.downloads.privacy
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
        this.snack.open(this.translate.instant('MEMBERSHIP.msgInvalidStripe', { email: this.brand.emails.support }), 'Ok', {
          duration: 15000,
          verticalPosition: 'top'
        });
        // this.waiting = false;
      });
  }

  async checkout(product)  {
    console.log(product);
    const newMember = JSON.parse(sessionStorage.getItem('app_member_pending'));
    this.waiting = true;
    await this.createCheckoutSession({
      priceId: product.product_stripe_price_id,
      // Allow for tax to be optional
      taxId: [product.product_tax_id],
      successUrl: this.brand.products.success_url,
      cancelUrl: this.brand.products.cancel_url,
      email: newMember.email,
      company: this.brand.prefix
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
      this.snack.open(this.translate.instant('MEMBERSHIP.msgInvalidStripe', { email: this.brand.emails.support }), 'Ok', {
        duration: 15000,
        verticalPosition: 'top'
      });
    }
  }
}
