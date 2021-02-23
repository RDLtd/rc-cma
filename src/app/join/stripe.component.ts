import { Component, OnInit } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js/pure';
import { environment } from '../../environments/environment';
import { AppConfig } from '../app.config';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'rc-stripe',
  templateUrl: './stripe.component.html'
})

export class StripeComponent implements OnInit {
  stripePromise = loadStripe(environment.stripe_key);
  stripeSessionId: any;
  stripeCustomerId: any = null;
  stripeSessionData: any;
  waiting: boolean;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private config: AppConfig,
    private http: HttpClient) {}

  ngOnInit(): void {
    this.waiting = false;
    this.route.paramMap.subscribe((params: ParamMap) => {
      console.log(params);
      this.stripeSessionId = params.get('session_id');
    });
    const p = new URLSearchParams(window.location.search);
    this.stripeSessionId = p.get('session_id');
    console.log(p.get('session_id'));
  }

  // Create Stripe Session
  async createCheckoutSession(options) {
    return this.http.post(`${this.config.apiUrl}/payments/create-session`, options).toPromise();
  };

  async checkout(product)  {
    this.waiting = true;
    await this.createCheckoutSession({
      priceId: this.config.brand.products[product].priceId,
      taxId: this.config.brand.products.taxId
    })
      .then(data => {
        console.log('Session', data)
        this.stripeSessionId = data['sessionId'];
        this.stripeCustomerId = data['customerId']
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

  async checkoutExistingCustomer(product) {
    // grab the customerId from somewhere
    const customerId = 'cus_IWXpiCGTtEfq50';
    this.waiting = true;
    await this.createCheckoutSession({
      customerId: customerId,
      priceId: this.config.brand.products[product].priceId,
      taxId: this.config.brand.products.taxId,
      restaurantName: 'Jim\'s Tender Hams'
    }).then(data => {
      this.stripeSessionId = data['sessionId'];
      console.log(data);
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

  manageSubscriptions() {
    return this.http.post(`${this.config.apiUrl}/payments/customer-portal`, {
      sessionId: this.stripeSessionId
    })
      .toPromise()
      .then(res => {
        console.log(res);
        window.open(res['url'], '_blank');
      });
  }
}
