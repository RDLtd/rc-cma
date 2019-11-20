import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Member } from '../_models';

@Injectable()

export class MemberService {

  constructor(
    private http: HttpClient,
    private config: AppConfig
  ) {}

  getAll() {
    return this.http.post(this.config.apiUrl + '/members',
      {
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getByAccessID(access_id: string) {
    return this.http.post(this.config.apiUrl + '/members/subset',
      {
        access_id: access_id,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getById(member_id: string) {
    return this.http.post(this.config.apiUrl + '/members/current',
      {
        member_id: member_id,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getDashboardData() {
    return this.http.post(this.config.apiUrl + '/members/dashboard',
      {
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  create(member: Member) {
    return this.http.post(this.config.apiUrl + '/members/create',
      {
        member: member,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  createAdministrator(administrator: any) {
    return this.http.post(this.config.apiUrl + '/members/createadministrator',
      {
        administrator: administrator,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  update(member: Member) {
    return this.http.post(this.config.apiUrl + '/members/update',
      {
        member: member,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  updateAdministrator(administrator: any) {
    return this.http.post(this.config.apiUrl + '/members/updateadministrator',
      {
        administrator: administrator,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  delete(member_id: string) {
    return this.http.post(this.config.apiUrl + '/members/delete',
      {
        member_id: member_id,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  sendemail(emailAddress, emailSubject, emailBody) {
    return this.http.post(this.config.apiUrl + '/members/sendemail',
      {
        emailAddress: emailAddress,
        emailSubject: emailSubject,
        emailBody: emailBody,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  sendwelcomeemail(member_id, restaurant_name, restaurant_number) {
    return this.http.post(this.config.apiUrl + '/members/sendwelcomeemail',
      {
        member_id: member_id,
        restaurant_name: restaurant_name,
        restaurant_number: restaurant_number,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  sendwelcomersvpemail(member_id, restaurant_name, restaurant_number, member_class) {
    return this.http.post(this.config.apiUrl + '/members/sendwelcomersvpemail',
      {
        member_id: member_id,
        restaurant_name: restaurant_name,
        restaurant_number: restaurant_number,
        member_class: member_class,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  sendrequestemail(member_id, restaurant_name, restaurant_number) {
    return this.http.post(this.config.apiUrl + '/members/sendrequestemail',
      {
        member_id: member_id,
        restaurant_name: restaurant_name,
        restaurant_number: restaurant_number,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  sendInfoEmail(member_id, restaurant_name, restaurant_number, agent_fullname) {
    return this.http.post(this.config.apiUrl + '/members/sendinfoemail',
      {
        member_id: member_id,
        restaurant_name: restaurant_name,
        restaurant_number: restaurant_number,
        agent_fullname: agent_fullname,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  sendrecoveryemail(member_email) {
    return this.http.post(this.config.apiUrl + '/members/sendrecoveryemail',
      {
        member_email: member_email,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  sendIntroEmail(restaurant_name: string, restaurant_email: string, restaurant_activation_code: string) {
    return this.http.post(this.config.apiUrl + '/members/send_intro_email',
      {
        restaurant_name: restaurant_name,
        restaurant_email: restaurant_email,
        restaurant_activation_code: restaurant_activation_code,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  login(memberemail: string, memberpassword: string) {
    return this.http.post(this.config.apiUrl + '/members/authenticate',
      {
        email: memberemail,
        password: memberpassword,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  password(memberid: string, memberpassword: string) {
    return this.http.post(this.config.apiUrl + '/members/password',
      {
        member_id: memberid,
        member_password: memberpassword,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  recordlogin(memberid: string) {
    return this.http.post(this.config.apiUrl + '/members/recordlogin',
      {
        member_id: memberid,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  messagesseen(memberid: string) {
    return this.http.post(this.config.apiUrl + '/members/messagesseen',
      {
        member_id: memberid,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  messages(memberaccesslevel: string, membermessageseen: string) {
    return this.http.post(this.config.apiUrl + '/members/messages',
      {
        member_access_level: memberaccesslevel,
        member_messages_seen: membermessageseen,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  loggedin() {
    return this.http.post(this.config.apiUrl + '/members/loggedin',
      {
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  setverified(memberid: string, membertoken: string) {
    return this.http.post(this.config.apiUrl + '/members/setverified',
      {
        member_id: memberid,
        member_token: membertoken,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getTransactions() {
    return this.http.post(this.config.apiUrl + '/members/transactions',
      {
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }
  //
  // readAvatar(memberid: string) {
  //   return this.http.post(this.config.apiUrl + '/members/readavatar',
  //     {
  //       member_id: memberid,
  //       userCode: this.config.userAPICode,
  //       token: this.jwt()
  //     }).pipe(map((response: any) => response.json()));
  // }
  //
  // writeAvatar(memberid: string, imageData: any) {
  //   return this.http.post(this.config.apiUrl + '/members/writeavatar',
  //     {
  //       member_id: memberid,
  //       imageData: imageData,
  //       userCode: this.config.userAPICode,
  //       token: this.jwt()
  //     }).pipe(map((response: any) => response.json()));
  // }

  updateAvatar(memberid: string, imageURL: string) {
    return this.http.post(this.config.apiUrl + '/members/updateavatar',
      {
        member_id: memberid,
        member_image_path: imageURL,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  deleteAvatar(memberid: string) {
    return this.http.post(this.config.apiUrl + '/members/deleteavatar',
      {
        member_id: memberid,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  // Generate Token
  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const requestOptions = {
      params: new HttpParams()
    };
    requestOptions.params.set('foo', 'bar');
    requestOptions.params.set('apiCategory', 'Financial');

    if (currentUser && currentUser.token) {
      requestOptions.params.set('Authorization', 'Bearer ' + currentUser.token);
    } else {
      requestOptions.params.set('Authorization', 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge');
    }
    return requestOptions;
  }

  dbconfig() {
    return this.http.post(this.config.apiUrl + '/members/dbconfig',
      {
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getMailChimpInfo(listID: string) {
    return this.http.post(this.config.apiUrl + '/members/mcinfo',
      {
        listID: listID,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  addMailChimpMember(listID: string, memberinfo) {
    return this.http.post(this.config.apiUrl + '/members/mcaddmember',
      {
        listID: listID,
        memberinfo: memberinfo,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  deleteMailChimpMember(listID: string, memberID: string) {
    return this.http.post(this.config.apiUrl + '/members/mcdeletemember',
      {
        listID: listID,
        memberID: memberID,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getMailChimpListMembers(listID: string) {
    return this.http.post(this.config.apiUrl + '/members/mclistmembers',
      {
        listID: listID,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getMailChimpMemberActivity(listID: string, memberID: string) {
    return this.http.post(this.config.apiUrl + '/members/mcmemberactivity',
      {
        listID: listID,
        memberID: memberID,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getHistory(restaurant_number: string) {
    return this.http.post(this.config.apiUrl + '/members/gethistory',
      {
        restaurant_number: restaurant_number,
        userCode: this.config.userAPICode,
        token: this.jwt()
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
        token: this.jwt()
      });
  }

  getCountry(country_locale: string) {
    return this.http.post(this.config.apiUrl + '/members/country',
      {
        country_locale: country_locale,
        userCode: this.config.userAPICode,
        token: this.jwt()
      });
  }

  getCountryByIP () {
    return this.http.get('https://ipinfo.io?token=b3a0582a14c7a4');
  }

  getLoginEmail(login_email: string) {
    return this.http.post(this.config.apiUrl + '/members/getloginemail',
      { login_email: login_email, userCode: this.config.userAPICode, token: this.jwt()});
  }

  getPromo(promo_code: string) {
    return this.http.post(this.config.apiUrl + '/members/getpromo',
      {
        promo_code: promo_code,
        userCode: this.config.userAPICode,
        token: this.jwt()});
  }

  getMemberPromoCode(member_id: number) {
    return this.http.post(this.config.apiUrl + '/members/getmemberpromocode',
      {
        member_id: member_id,
        userCode: this.config.userAPICode,
        token: this.jwt()});
  }

  addPromoAction(promo_code: string, promo_action: string, promo_member_id: number) {
    return this.http.post(this.config.apiUrl + '/members/addpromoaction',
      {
        promo_code: promo_code,
        promo_action: promo_action,
        promo_member_id: promo_member_id,
        userCode: this.config.userAPICode,
        token: this.jwt()});
  }

}
