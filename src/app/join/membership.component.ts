import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { loadStripe } from '@stripe/stripe-js/pure';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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
  stripePromise = loadStripe(environment.stripe_key);
  stringInCode: any;

  constructor(
    private config: AppConfig,
    private http: HttpClient,
    private route: ActivatedRoute,
    private trans: TranslateService
  ) {

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
      console.log('stripeSessionId', this.stripeSessionId);
    });
  }

  // getTranslations(): void {
  //   // Use get to ensure that translation is available before using 'instant'
  //   this.trans.get('MembershipOptions')
  //     .subscribe(() => console.log('MembershipOptions loaded'));
  // }

  // Create Stripe Session
  async createCheckoutSession(options) {
    return this.http.post(`${this.config.apiUrl}/payments/create-session`, options).toPromise();
  };

  async checkout(product)  {
    const newMember = JSON.parse(sessionStorage.getItem('rc_member_pending'));
    this.waiting = true;
    const brandProduct = this.config.brand.products;
    await this.createCheckoutSession({
      priceId: brandProduct[product].priceId,
      taxId: brandProduct.taxId,
      successUrl: brandProduct.success_url,
      cancelUrl: brandProduct.cancel_url,
      email: newMember.email
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
    }
  }

}
