import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService, MemberService } from '../../_services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AppService } from '../../_services/app.service';
import { Restaurant } from '../../_models';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'rc-payment',
  templateUrl: './payment.component.html'
})

export class PaymentComponent implements OnInit  {

  restaurant: Restaurant;
  brand: any;

  p_description;
  p_amount;
  p_amount_no_vat;
  p_currency;
  invoice_number;
  renewal_date;
  d_renewal_date;

  t_data;
  lblWait;
  lblUpdating;
  lblUpgrade;
  lblCancelled;
  btnLabel;
  isLoading: boolean = false;

  submittedForm = false;
  agent;

  constructor(
    private appService: AppService,
    private appConfig: AppConfig,
    public snackBar: MatSnackBar,
    private router: Router,
    private restaurantService: RestaurantService,
    private memberService: MemberService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService) { }

  ngOnInit() {
    // get local storage and translation variables
    this.restaurant = this.data.restaurant;
    this.agent = this.data.agent;
    this.brand = this.appConfig.brand;

    this.translate.get('Payment').subscribe(data => {
      this.t_data = data;
      this.lblWait = this.t_data.Wait;
      this.lblUpdating = this.t_data.Updating;
      this.lblUpgrade = this.t_data.UpgradeUpper;
      this.lblCancelled = this.t_data.CancelledUpper;
      this.btnLabel = this.lblUpgrade;
    });

    // create renewal date, only if this restaurant is already a full member
    if (this.restaurant.restaurant_full_member_on) {
      let reg_date = new Date(this.restaurant.restaurant_full_member_on);
      reg_date.setFullYear(reg_date.getFullYear() + 1);
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      this.renewal_date = reg_date.toLocaleDateString('en-US', options);
      moment.locale(localStorage.getItem('rd_language'));
      this.d_renewal_date = moment(reg_date).format('dddd, DD MMMM YYYY');
    }
  }

  openCheckout(level, restaurant_id) {

    this.isLoading = true;
    this.btnLabel = this.lblWait;

    if (level === 'Full') {

      this.p_description = this.t_data.UpgradeLower + this.brand.currency.symbol +
        this.brand.fee.year + ' ' + this.t_data.Tax;
      // NB this needs to be updated for France
      // this.p_amount_no_vat = 4200; // NB reset to 4200 for UK
      this.p_amount_no_vat = Math.trunc(this.brand.fee.year * 100); // NB reset to 4200 for UK
      this.p_amount = Math.trunc(this.brand.fee.yearIncVat * 100);
      this.p_currency = this.brand.currency.code;
      this.invoice_number = 'to come'; // create a placeholder which will then be updated
      const first_self = this;

      const handler = (<any>window).StripeCheckout.configure({
        // pk_test_3UC3P4HUDtjPewUWjzpP0GHs
        // pk_live_aC07Pi3YT3GGv7QYujVxWvPt
        // I think it is OK to have this key here, since payments can only be processed using the sk on the server side
        // TODO: Switch to LIVE key
        key: 'pk_test_3UC3P4HUDtjPewUWjzpP0GHs',
        locale: 'auto',
        token: (token: any) => {
          // Note 'fat arrow' for scope...
          console.log('returned token ', token, 'id ', restaurant_id);

          this.btnLabel = this.lblUpdating;
          const self = this;
          this.submittedForm = true;

          this.restaurantService.sendPayment(token, restaurant_id, this.p_amount, this.p_currency,
            this.p_description, this.invoice_number)
            .subscribe(
              data => {
                console.log(data);

                // payment was successful, so update the restaurant rc_member_status accordingly
                self.data.restaurant.restaurant_rc_member_status = level;
                self.data.dialog.closeAll();
                self.isLoading = false;

                // updated invoice number appears in data
                this.restaurantService.updateMemberStatus(restaurant_id, level)
                  .subscribe(
                    status => {
                      console.log(status);
                    },
                    error => {
                      console.log('Error in updating member status ' + error);
                    });
                // also need to generate an invoice
                //      payment_amount
                //      payment_currency
                //      payment_description
                //      payment_reference
                //      card_type
                //      card_last4
                this.createInvoice(restaurant_id, data['invoice_number'], this.p_amount_no_vat / 100,
                  this.brand.currency.code, this.p_description, token);
                // send a welcome if this was triggered by an agent
                if (this.agent) {
                  // TODO: Need to set up an association here, but what if it has already been set up?
                  // TODO: Could it be that the agent might be upselling AFTER having set as associate?
                  // if the payment was successful, send the welcome email
                  this.memberService.sendwelcomersvpemail(this.restaurant.restaurant_member_id,
                    this.restaurant.restaurant_name,
                    this.restaurant.restaurant_number,
                    'a Full').subscribe(
                    data => {
                      console.log(JSON.stringify(data));
                    },
                    error => {
                      console.log(JSON.stringify(error));
                    });
                }
                this.openSnackBar(this.t_data.Success, '');
              },
              error => {
                console.log('Error in payment method API ' + error);
                this.snackBar.open(this.t_data.Error, 'OK', {
                  duration: 20000,
                  verticalPosition: 'top'
                });
                this.data.dialog.closeAll();

              });
        }
      });

      handler.open({
        image: 'https://res.cloudinary.com/rdl/image/upload/v1534065778/RC-logo-NoText_b7oecp.jpg',
        name: this.brand.name,
        description: this.t_data.Membership + ' ' + this.brand.currency.symbol +
          this.brand.fee.year + ' ' + this.t_data.TaxNoBracket,
        // description: this.t_data.MembershipFor +  ' ' + this.restaurant.restaurant_name + ' (' + this.company_currency_symbol +
        //   this.company_annual_fee + ' ' + this.t_data.Tax,
        currency: this.brand.currency.code,
        amount: this.p_amount,
        email: this.restaurant.restaurant_email,
        billingAddress: false,
        closed: function () {
          first_self.HandleClosed();
        }
      });
    }

  }

  HandleClosed() {
    // hack from https://stackoverflow.com/questions/21441814/stripe-simple-checkout-detect-if-close-button-is-clicked
    if (this.submittedForm === false) {
      this.btnLabel = this.lblCancelled;
    }
  }

  createInvoice(restaurant_id, invoice_number, amount, currency, description, token) {
    this.restaurantService.sendInvoice(restaurant_id, Number(this.restaurant.restaurant_member_id),
      invoice_number, amount, currency, description, token)
      .subscribe(
        () => {
          console.log('Invoice sent');
        },
        error => {
          console.log('Error - failed to send invoice ' + error);
        });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  goto(page){
    this.router.navigate([`restaurants/${this.restaurant.restaurant_id}/cms/${page}`]);
    this.data.dialog.closeAll();
  }

}
