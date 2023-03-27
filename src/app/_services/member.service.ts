import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Member } from '../_models';
import { AppService } from './app.service';
import { lastValueFrom } from 'rxjs';

@Injectable()

export class MemberService {

  authToken;
  brand;

  constructor(
    private http: HttpClient,
    private config: AppConfig,
    private appService: AppService
  ) {
    this.appService.authToken.subscribe(token => {
      this.authToken = token;
    });
    this.brand = this.config.brand;
  }

  getAll() {
    return this.http.post(this.config.apiUrl + '/members',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getByAccessID(access_id: string) {
    return this.http.post(this.config.apiUrl + '/members/subset',
      {
        access_id: access_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getById(member_id: string) {
    return this.http.post(this.config.apiUrl + '/members/current',
      {
        member_id: member_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getDashboardData() {
    return this.http.post(this.config.apiUrl + '/members/dashboard',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  create(member: Member) {
    return this.http.post(this.config.apiUrl + '/members/create',
      {
        member: member,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createAdministrator(administrator: any) {
    console.log('CREATE',  localStorage.getItem('rd_brand'));
    return this.http.post(this.config.apiUrl + '/members/create_new_member',
      {
        company_prefix: localStorage.getItem('rd_brand'),
        administrator: administrator,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  update(member: Member) {
    return this.http.post(this.config.apiUrl + '/members/update',
      {
        member: member,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateAdministrator(administrator: any) {
    return this.http.post(this.config.apiUrl + '/members/updateadministrator',
      {
        administrator: administrator,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  delete(member_id: string) {
    return this.http.post(this.config.apiUrl + '/members/delete',
      {
        member_id: member_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  // Set emailTo/emailFrom 'curation' or 'support
  sendEmailRequest(to, from, subject, content) {

    //  const company = this.config[localStorage.getItem('rd_country') + '_company'];

    // Allow a custom 'to' email to be passed for testing purposes
    const emailTo = (to !== 'curation' && to !== 'support') ? to : this.brand.email[to];

    console.log(this.brand.prefix);
    return this.http.post(this.config.apiUrl + '/members/sendemail',
      {
        company_name: this.brand.name,
        company_prefix: this.brand.prefix,
        email_to: emailTo,
        email_from: this.brand.email[from],
        email_subject: subject,
        email_body: content,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendAddRestaurantInProgress(member_first_name, member_last_name, member_email,
                              newRestaurantName, newRestaurantPostcode, newRestaurantTel) {
    return this.http.post(this.config.apiUrl + '/members/send_add_restaurant_in_progress',
      {
        company_prefix: this.brand.prefix,
        member_first_name,
        member_last_name,
        member_email,
        newRestaurantName,
        newRestaurantPostcode,
        newRestaurantTel,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }


  sendwelcomeemail(member_id, restaurant_name, restaurant_number) {
    return this.http.post(this.config.apiUrl + '/members/sendwelcomeemail',
      {
        company_prefix: this.brand.prefix,
        member_id: member_id,
        restaurant_name: restaurant_name,
        restaurant_number: restaurant_number,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendwelcomersvpemail(member_id, restaurant_name, restaurant_number, member_class) {
    return this.http.post(this.config.apiUrl + '/members/sendwelcomersvpemail',
      {
        company_prefix: this.brand.prefix,
        member_id: member_id,
        restaurant_name: restaurant_name,
        restaurant_number: restaurant_number,
        member_class: member_class,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendrequestemail(member_id, restaurant_name, restaurant_number) {
    return this.http.post(this.config.apiUrl + '/members/sendrequestemail',
      {
        company_prefix: this.brand.prefix,
        member_id: member_id,
        restaurant_name: restaurant_name,
        restaurant_number: restaurant_number,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendInfoEmail(member_id, restaurant_name, restaurant_number, agent_fullname) {
    return this.http.post(this.config.apiUrl + '/members/sendinfoemail',
      {
        company_prefix: this.brand.prefix,
        member_id: member_id,
        restaurant_name: restaurant_name,
        restaurant_number: restaurant_number,
        agent_fullname: agent_fullname,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendrecoveryemail(member_email) {
    return this.http.post(this.config.apiUrl + '/members/sendrecoveryemail',
      {
        company_prefix: this.brand.prefix,
        member_email: member_email,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendIntroEmail(restaurant_name: string, restaurant_email: string, restaurant_activation_code: string) {
    return this.http.post(this.config.apiUrl + '/members/send_intro_email',
      {
        company_prefix: this.brand.prefix,
        restaurant_name: restaurant_name,
        restaurant_email: restaurant_email,
        restaurant_activation_code: restaurant_activation_code,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  login(memberemail: string, memberpassword: string) {
    return this.http.post(this.config.apiUrl + '/members/authenticate',
      {
        email: memberemail,
        password: memberpassword,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  password(memberid: string, memberpassword: string) {
    return this.http.post(this.config.apiUrl + '/members/password',
      {
        member_id: memberid,
        member_password: memberpassword,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  recordlogin(memberid: string) {
    return this.http.post(this.config.apiUrl + '/members/recordlogin',
      {
        member_id: memberid,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  messagesseen(member_id: number, message_id: number) {
    return this.http.post(this.config.apiUrl + '/members/messagesseen',
      {
        member_id: member_id,
        message_id: message_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  messages(memberid: string, memberaccesslevel: string, membermessageseen: string) {
    return this.http.post(this.config.apiUrl + '/members/messages',
      {
        company_code: this.config.brand.prefix,
        member_id: memberid,
        member_access_level: memberaccesslevel,
        member_messages_seen: membermessageseen,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  loggedin() {
    return this.http.post(this.config.apiUrl + '/members/loggedin',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  setverified(memberid: string, membertoken: string) {
    return this.http.post(this.config.apiUrl + '/members/setverified',
      {
        member_id: memberid,
        member_token: membertoken,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getTransactions() {
    return this.http.post(this.config.apiUrl + '/members/transactions',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }
  //
  // readAvatar(memberid: string) {
  //   return this.http.post(this.config.apiUrl + '/members/readavatar',
  //     {
  //       member_id: memberid,
  //       userCode: this.config.userAPICode,
  //       token: this.authToken
  //     }).pipe(map((response: any) => response.json()));
  // }
  //
  // writeAvatar(memberid: string, imageData: any) {
  //   return this.http.post(this.config.apiUrl + '/members/writeavatar',
  //     {
  //       member_id: memberid,
  //       imageData: imageData,
  //       userCode: this.config.userAPICode,
  //       token: this.authToken
  //     }).pipe(map((response: any) => response.json()));
  // }

  updateAvatar(memberid: string, imageURL: string) {
    console.log('IMAGEURL', imageURL);
    return this.http.post(this.config.apiUrl + '/members/updateavatar',
      {
        member_id: memberid,
        member_image_path: imageURL,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteAvatar(memberid: string) {
    return this.http.post(this.config.apiUrl + '/members/deleteavatar',
      {
        member_id: memberid,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  dbconfig() {
    return this.http.post(this.config.apiUrl + '/members/dbconfig',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getMailChimpInfo(listID: string) {
    return this.http.post(this.config.apiUrl + '/members/mcinfo',
      {
        listID: listID,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  addMailChimpMember(listID: string, memberinfo) {
    return this.http.post(this.config.apiUrl + '/members/mcaddmember',
      {
        listID: listID,
        memberinfo: memberinfo,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteMailChimpMember(listID: string, memberID: string) {
    return this.http.post(this.config.apiUrl + '/members/mcdeletemember',
      {
        listID: listID,
        memberID: memberID,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getMailChimpListMembers(listID: string) {
    return this.http.post(this.config.apiUrl + '/members/mclistmembers',
      {
        listID: listID,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getMailChimpMemberActivity(listID: string, memberID: string) {
    return this.http.post(this.config.apiUrl + '/members/mcmemberactivity',
      {
        listID: listID,
        memberID: memberID,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getHistory(restaurant_number: string) {
    return this.http.post(this.config.apiUrl + '/members/gethistory',
      {
        restaurant_number: restaurant_number,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  addHistory(restaurant_number: string, activity: string, title: string, timestamp: string) {
    return this.http.post(this.config.apiUrl + '/members/addhistory',
      {
        restaurant_number: restaurant_number,
        activity: activity,
        title: title,
        timestamp: timestamp,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getCountry(country_locale: string) {
    return this.http.post(this.config.apiUrl + '/members/country',
      {
        country_locale: country_locale,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getCountryByIP () {
    return this.http.get('https://ipinfo.io?token=b3a0582a14c7a4');
  }

  getLoginEmail(login_email: string) {
    return this.http.post(this.config.apiUrl + '/members/getloginemail',
      { login_email: login_email, userCode: this.config.userAPICode, token: this.authToken});
  }

  async getReferral(referralCode: string) {
      const data = await lastValueFrom(this.http.post(this.config.apiUrl + '/members/getpromo',
      {
        promo_code: referralCode,
        userCode: this.config.userAPICode,
        token: this.authToken
      }));
      // return promo actions
      return data['promos'];
  }

  checkFreePromo(promo_code: string) {
    return this.http.post(this.config.apiUrl + '/members/checkfreepromo',
      {
        promo_code: promo_code,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getPromo(promo_code: string) {
    return this.http.post(this.config.apiUrl + '/members/getpromo',
      {
        promo_code: promo_code,
        userCode: this.config.userAPICode,
        token: this.authToken});
  }

  getMemberPromoCode(member_id: number) {
    return this.http.post(this.config.apiUrl + '/members/getmemberpromocode',
      {
        member_id: member_id,
        userCode: this.config.userAPICode,
        token: this.authToken});
  }

  addPromoAction(promo_code: string, promo_action: string, promo_member_id: number) {
    return this.http.post(this.config.apiUrl + '/members/addpromoaction',
      {
        promo_code: promo_code,
        promo_action: promo_action,
        promo_member_id: promo_member_id,
        userCode: this.config.userAPICode,
        token: this.authToken});
  }

  async createFreeMembership(formData) {
    return lastValueFrom(this.http.post(`${this.config.apiUrl}/payments/register-free-member`, {
      pending: formData,
      launch_number: 0,
      company: this.config.brand.prefix,
      userCode: this.config.userAPICode,
      token: this.authToken
    }))
      .catch( err => {
        console.log(err, 'Error creating free membership');
      });
  }

  async preFlight(formData: any) {
    // console.log(formData);
    return await lastValueFrom(this.http.post(`${this.config.apiUrl}/members/preflight`, {
      administrator: {
        member_email: formData.email,
        member_telephone: formData.telephone
      },
      userCode: this.config.userAPICode,
      token: this.authToken
    }));
  }

  getAllPending() {
    return this.http.post(this.config.apiUrl + '/members/get_pending',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }
  // createPending(pending: any) {
  //   console.log('MS', pending);
  //   pending.telephone = pending.tel;
  //   pending.job = pending.role;
  //   return this.http.post(this.config.apiUrl + '/members/create_pending',
  //     {
  //       pending: pending,
  //       userCode: this.config.userAPICode,
  //       token: this.authToken
  //     });
  // }

  createPending(pending: any) {
    console.log('MS PENDING', pending);
    return this.http.post(this.config.apiUrl + '/members/create_pending',
      {
          pending,
          company: this.config.brand.prefix,
          userCode: this.config.userAPICode,
          token: this.authToken
      });
  }

  deleteAllPending(pending: any) {
    return this.http.post(this.config.apiUrl + '/members/delete_pending',
      {
        pending: pending,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  accessCustomerPortal(customer_id: string, api_url: string) {
    // console.log('service', customer_id, api_url);
    return this.http.post(this.config.apiUrl + '/payments/create-customer-portal-session',
      {
        customer_id: customer_id,
        api_url: api_url,
        userCode: this.config.userAPICode,
        token: this.authToken,
        company: this.config.brand.prefix
      });
  }

  getUpcomingInvoice(customer_id: string) {
    console.log('getUpcomingInvoice', customer_id);
    return this.http.post(this.config.apiUrl + '/payments/get-upcoming-invoice',
      {
        customer_id: customer_id,
        userCode: this.config.userAPICode,
        token: this.authToken,
        company: this.config.brand.prefix
      });
  }

  // changeSubscription( member_id: string, customer_id: string) {
  //   // console.log('changeSubscription', member_id, subscription_id, price_id);
  //   return this.http.post(this.config.apiUrl + '/payments/change-subscription',
  //     {
  //       member_id: member_id,
  //       customer_id: customer_id,
  //       userCode: this.config.userAPICode,
  //       token: this.authToken
  //     });
  // }

  getStripeCustomerNumber(member_id: string) {
    // console.log(member_id);
    return this.http.post(this.config.apiUrl + '/members/get_stripe_customer_id',
      {
        member_id: member_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getProducts() {
    return this.http.post(this.config.apiUrl + '/members/getproducts',
      {
        company: this.config.brand.prefix,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getProductsMaxRestaurants(max_restaurants: number) {
    return this.http.post(this.config.apiUrl + '/members/getproductsmaxrestaurants',
      {
        company: this.config.brand.prefix,
        max_restaurants: max_restaurants,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteRestaurantSubscription(subscription_id: string) {
    console.log('deleteRestaurantSubscription', subscription_id);
    return this.http.post(this.config.apiUrl + '/payments/delete-restaurant-subscription',
      {
        subscription_id: subscription_id,
        userCode: this.config.userAPICode,
        token: this.authToken,
        company: this.config.brand.prefix
      });
  }

  createRestaurantSubscription( member_id: string, customer_id: string, price_id: string, tax_id: string, quantity: number) {
    console.log('createRestaurantSubscription', member_id, price_id, customer_id, tax_id, quantity);
    return this.http.post(this.config.apiUrl + '/payments/create-restaurant-subscription',
      {
        member_id: member_id,
        customer_id: customer_id,
        price_id: price_id,
        tax_id: tax_id,
        quantity: quantity,
        userCode: this.config.userAPICode,
        token: this.authToken,
        company: this.config.brand.prefix
      });
  }

  addRestaurantSubscription( member_id: string, subscription_id: string, price_id: string, tax_id: string, quantity: number) {
    console.log('addRestaurantSubscription', member_id, subscription_id, price_id, quantity);
    return this.http.post(this.config.apiUrl + '/payments/add-restaurant-subscription',
      {
        member_id: member_id,
        subscription_id: subscription_id,
        price_id: price_id,
        tax_id: tax_id,
        quantity: quantity,
        userCode: this.config.userAPICode,
        token: this.authToken,
        company: this.config.brand.prefix
      });
  }

  getFAQs(language: string) {
    return this.http.post(this.config.apiUrl + '/members/faqs',
      {
        userCode: this.config.userAPICode,
        token: this.authToken,
        language
      });
  }

}
