import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { loadStripe } from '@stripe/stripe-js/pure';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'rc-membership',
  templateUrl: './membership.component.html'
})
export class MembershipComponent implements OnInit {

  waiting = false;
  stripeSessionId: string;
  stripePromise = loadStripe(environment.stripe_key);

  constructor(
    private config: AppConfig,
    private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log(this.config.appUrl);
    this.route.queryParams.subscribe(params => {
      this.stripeSessionId = params['session_id'];
      console.log('stripeSessionId', this.stripeSessionId);
    });
  }

  // Create Stripe Session
  async createCheckoutSession(options) {
    return this.http.post(`${this.config.apiUrl}/payments/create-session`, options).toPromise();
  };

  async checkout(product)  {
    this.waiting = true;
    const brandProduct = this.config.brand.products;
    await this.createCheckoutSession({
      priceId: brandProduct[product].priceId,
      taxId: brandProduct.taxId,
      successUrl: brandProduct.success_url,
      cancelUrl: brandProduct.cancel_url
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
