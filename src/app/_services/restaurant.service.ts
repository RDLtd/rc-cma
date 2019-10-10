import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Offer, Restaurant, SQLParameters, LaunchParameters } from '../_models/';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()

export class RestaurantService {

  constructor(
    private http: HttpClient,
    private config: AppConfig) { }

  getAll() {
    return this.http.post(this.config.apiUrl + '/restaurants',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  countAll() {
    return this.http.post(this.config.apiUrl + '/restaurants/count',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getById(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/current',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt()});
  }

  getForCuration(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/getforcuration',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getSubset(sql_parameters: SQLParameters) {
    return this.http.post(this.config.apiUrl + '/restaurants/subset',
      { sql_parameters: sql_parameters, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getLaunch(launch_parameters: LaunchParameters) {
    return this.http.post(this.config.apiUrl + '/restaurants/getlaunch',
      { launch_parameters: launch_parameters, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getRegionRestaurants(region: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/byregion',
      { region: region, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getCurationRestaurants(curation_id: number, data_status: string, name_filter: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/bycuration',
      { curation_id: curation_id, data_status: data_status, name_filter: name_filter,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  getMapData() {
    return this.http.post(this.config.apiUrl + '/restaurants/mapdata',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getDashboardData() {
    return this.http.post(this.config.apiUrl + '/restaurants/dashboard',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getPrimaryDashboardData() {
    return this.http.post(this.config.apiUrl + '/restaurants/primarydashboard',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getRegionDashboardData() {
    return this.http.post(this.config.apiUrl + '/restaurants/regiondashboard',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getAttributeDashboardData() {
    return this.http.post(this.config.apiUrl + '/restaurants/attributedashboard',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  create(restaurant: Restaurant) {
    return this.http.post(this.config.apiUrl + '/restaurants/create',
      { restaurant: restaurant, userCode: this.config.userAPICode, token: this.jwt() });
  }

  update(restaurant: Restaurant) {
    return this.http.post(this.config.apiUrl + '/restaurants/update',
      { restaurant: restaurant, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateGPS(restaurant_id: string, restaurant_lat: number, restaurant_lng: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/updategps',
      { restaurant_id: restaurant_id, restaurant_lat: restaurant_lat,
        restaurant_lng: restaurant_lng, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateDataStatus (restaurant_id: string, restaurant_data_status: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/updatedatastatus',
      { restaurant_id: restaurant_id, restaurant_data_status: restaurant_data_status,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateLaunchNumber (restaurant_id: string, launch_number: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/updatelaunchnumber',
      { restaurant_id: restaurant_id, launch_number: launch_number,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  delete(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/delete',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  verify(restaurant_id: string, verified_by: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/verify',
      { restaurant_id: restaurant_id, verified_by: verified_by,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  getCuisines(country_code, restaurant_region: string) {
    if (country_code === 'FR') {
      return this.http.post(this.config.apiUrl + '/restaurants/frenchcuisine',
        {restaurant_region: restaurant_region, userCode: this.config.userAPICode, token: this.jwt()});
    } else {
      return this.http.post(this.config.apiUrl + '/restaurants/cuisine',
        {restaurant_region: restaurant_region, userCode: this.config.userAPICode, token: this.jwt()});
    }
  }

  getBookings(country_code, restaurant_region: string) {
    if (country_code === 'FR') {
      return this.http.post(this.config.apiUrl + '/restaurants/frenchbookings',
        {restaurant_region: restaurant_region, userCode: this.config.userAPICode, token: this.jwt()});
    } else {
      return this.http.post(this.config.apiUrl + '/restaurants/bookings',
        {restaurant_region: restaurant_region, userCode: this.config.userAPICode, token: this.jwt()});
    }
  }

  getPostCode(postcode: string) {
    // just send the first segment of the post code
    const firstpart = postcode.substring(0, postcode.indexOf(' '));
    return this.http.post(this.config.apiUrl + '/restaurants/postcode',
      { postcode: firstpart, userCode: this.config.userAPICode, token: this.jwt() } );
  }

  getFrenchPostCode(postcode: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/frenchpostcode',
      { postcode: postcode, userCode: this.config.userAPICode, token: this.jwt() } );
  }

  getRegions(country_code) {
    if (country_code === 'FR') {
      return this.http.post(this.config.apiUrl + '/restaurants/frenchregions',
        {country_code: country_code, userCode: this.config.userAPICode, token: this.jwt()});
    } else {
      return this.http.post(this.config.apiUrl + '/restaurants/regions',
        {country_code: country_code, userCode: this.config.userAPICode, token: this.jwt()});
    }
  }

  getAnalysis(country_code) {
    return this.http.post(this.config.apiUrl + '/restaurants/analysis',
      { country_code: country_code, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getGroups() {
    return this.http.post(this.config.apiUrl + '/restaurants/groups',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getCuration() {
    return this.http.post(this.config.apiUrl + '/restaurants/curation',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getCurationZone(curation_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/curationzone',
      { curation_id: curation_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getCurationZoneSet(curator_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/curationzoneset',
      { curator_id: curator_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateCurationZoneCurator(curation_id: number, assigned_curator_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/updatecurationzonecurator',
      { curation_id: curation_id, assigned_curator_id: assigned_curator_id,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  getCurationStats() {
    return this.http.post(this.config.apiUrl + '/restaurants/curationstats',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  fixPACA(paca_post_code, paca_curation_id) {
    return this.http.post(this.config.apiUrl + '/restaurants/fixpaca',
      { paca_post_code: paca_post_code, paca_curation_id: paca_curation_id,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  writeStub(spider_name: string, spider_file: string, spider_post_code: string, spider_postcode_uk_region: string,
            spider_lat: number, spider_lng: number, spider_curation_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/writestub',
      { spider_name: spider_name, spider_file: spider_file, spider_post_code: spider_post_code,
        spider_postcode_uk_region: spider_postcode_uk_region, spider_lat: spider_lat, spider_lng: spider_lng,
        spider_curation_id: spider_curation_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  writeSpider(spider_restaurant_id: number, spider_name: string, spider_address: string,
              spider_location: string, spider_post_code: number, spider_lat: number,
              spider_lng: number, spider_region: string, spider_phone: string, spider_email: string,
              spider_website: string, spider_meals: string, spider_features: string, spider_cuisine: string,
              spider_days: string, spider_hours: string, spider_description: string,
              spider_booking: string, spider_deliveroo: string, spider_file: string,
              spider_file_length: number, spider_file_lines: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/writespider',
      { spider_restaurant_id: spider_restaurant_id, spider_name: spider_name, spider_address: spider_address,
        spider_location: spider_location, spider_post_code: spider_post_code, spider_lat: spider_lat, spider_lng: spider_lng,
        spider_region: spider_region, spider_phone: spider_phone, spider_email: spider_email,
        spider_website: spider_website, spider_meals: spider_meals, spider_features: spider_features,
        spider_cuisine: spider_cuisine, spider_days: spider_days, spider_hours: spider_hours,
        spider_description: spider_description, spider_booking: spider_booking, spider_file: spider_file,
        spider_deliveroo: spider_deliveroo, spider_file_length: spider_file_length,
        spider_file_lines: spider_file_lines, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getSpiderKetchup() {
    return this.http.post(this.config.apiUrl + '/restaurants/getspiderketchup',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  // associations routes
  // router.post('/associations', getAssociations);
  // router.post('/memberassociations', getMemberAssociations);
  // router.post('/memberrestaurants', getMemberRestaurants);
  // router.post('/addassociation', addAssociation);
  // router.post('/removeassociation', removeAssociation);
  // router.post('/checkassociation', checkAssociation);

  getAssociations() {
    return this.http.post(this.config.apiUrl + '/restaurants/associations',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getMemberAssociations(member_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/memberassociations',
      { member_id: member_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  addAssociation(member_id: string, restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/addassociation',
      { member_id: member_id, restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  removeAssociation(association_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/removeassociation',
      { association_id: association_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  checkAssociation(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/checkassociation',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getMemberRestaurants(member_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/memberrestaurants',
      { member_id: member_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getMemberRestaurantNames(member_id: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/memberrestaurantnamess',
      { member_id: member_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  checkHTMLFile(html_file: string) {
    // console.log(html_file);
    return this.http.post(this.config.apiUrl + '/restaurants/checkhtmlfile',
      { html_file: html_file, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getCurationNotes(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/curationnotes',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  addCurationNotes(curation_notes_restaurant_id: number, curation_notes_curator_id: number,
                   curation_notes_text: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/addcurationnotes',
      { curation_notes_restaurant_id: curation_notes_restaurant_id,
        curation_notes_curator_id: curation_notes_curator_id, curation_notes_text: curation_notes_text,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateCurationNotes(curation_notes_restaurant_id: number, curation_notes_curator_id: number,
                      curation_notes_text: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/updatecurationnotes',
      { curation_notes_restaurant_id: curation_notes_restaurant_id,
        curation_notes_curator_id: curation_notes_curator_id, curation_notes_text: curation_notes_text,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteCurationNotes(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/deletecurationnotes',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getCurationRequests() {
    return this.http.post(this.config.apiUrl + '/restaurants/curationrequests',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  addCurationRequest(curation_request_restaurant_id: number, curation_request_member_id: number,
                     curation_request_notes: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/addcurationrequest',
      { restaurant_id: curation_request_restaurant_id,
        member_id: curation_request_member_id, request_notes: curation_request_notes,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateCurationRequest(curation_request_id: number, curation_request_notes: string,
                        curation_request_status: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/updatecurationrequest',
      { curation_request_id: curation_request_id,
        request_notes: curation_request_notes, request_status: curation_request_status,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteCurationRequest(curation_request_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/deletecurationrequest',
      { curation_request_id: curation_request_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getPartners() {
    return this.http.post(this.config.apiUrl + '/restaurants/partners',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getOffers() {
    return this.http.post(this.config.apiUrl + '/restaurants/offers',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  addOffer(offer: Offer) {
    return this.http.post(this.config.apiUrl + '/restaurants/addoffer',
      { offer: offer, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getRestaurantAccessRecords(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/restaurantaccess',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getLatestAccess(restaurant_id: number, access_function: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/latestaccess',
      { restaurant_id: restaurant_id, access_function: access_function,
        userCode: this.config.userAPICode, token: this.jwt() });
  }


  recordAccess(restaurant_id: number, partner_id: number, access_function: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/recordaccess',
      { restaurant_id: restaurant_id, partner_id: partner_id,
        access_function: access_function, userCode: this.config.userAPICode, token: this.jwt() });
  }

  sendPayment(payment_token: any, restaurant_id: number, payment_amount: number,
              payment_currency: string, payment_description: string, payment_invoice_number: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/sendpayment',
      { payment_token: payment_token, restaurant_id: restaurant_id, payment_amount: payment_amount,
        payment_currency: payment_currency, payment_description: payment_description, payment_invoice_number: payment_invoice_number,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  sendInvoice(restaurant_id: number, restaurant_member_id: number, invoice_number: string, payment_amount: number,
              payment_currency: string, payment_description: string, payment_token: any) {
    return this.http.post(this.config.apiUrl + '/restaurants/sendinvoice',
      { restaurant_id: restaurant_id, restaurant_member_id: restaurant_member_id,
        invoice_number: invoice_number, payment_amount: payment_amount,
        payment_currency: payment_currency, payment_description: payment_description, payment_token: payment_token,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  getPayments(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/getpayments',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateMemberStatus(restaurant_id: number, status: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/updatememberstatus',
      { restaurant_id: restaurant_id, status: status, userCode: this.config.userAPICode, token: this.jwt() });
  }

  setRCMember(restaurant_id: number, state: string) {
    return this.http.post(this.config.apiUrl + '/restaurants/setrcmember',
      { restaurant_id: restaurant_id, state: state, userCode: this.config.userAPICode, token: this.jwt() });
  }

  setLaunchBatch(launch_number: number, curation_id: number){
    return this.http.post(this.config.apiUrl + '/restaurants/setlaunchbatch',
      { launch_number: launch_number, curation_id: curation_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  fixRestaurantNumbers(country_code: string, curation_id: number){
    return this.http.post(this.config.apiUrl + '/restaurants/fixrestaurantnumbers',
      { country_code: country_code, curation_id: curation_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getRSVPEvents() {
    return this.http.post(this.config.apiUrl + '/restaurants/getrsvpevents',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  getRSVPEventID(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/restaurants/getrsvpeventid',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
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



  // generate token
  // private jwt() {
  //   // create authorization header with jwt token
  //   const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  //   if (currentUser && currentUser.token) {
  //     const headers = new Headers({
  //       'Authorization': 'Bearer ' + currentUser.token,
  //       'apiCategory': 'Restaurant'
  //     });
  //     return new RequestOptions({ headers: headers });
  //   } else {
  //     // if there is no user, then we must invent a token
  //     const headers = new Headers({
  //       'Authorization': 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge' ,
  //       'apiCategory': 'Restaurant'
  //     });
  //     return new RequestOptions({ headers: headers });
  //   }
  // }
}

