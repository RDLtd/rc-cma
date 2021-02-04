import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Member } from '../_models';
import { AppService } from './app.service';

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
      let data = await this.http.post(this.config.apiUrl + '/members/getpromo',
      {
        promo_code: referralCode,
        userCode: this.config.userAPICode,
        token: this.authToken
      }).toPromise();
      return data['promos'][0];
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

}
