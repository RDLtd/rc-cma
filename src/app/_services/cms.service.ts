import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { CMSElement, CMSTime, CMSAttribute, CMSMeal, CMSDescription, CMSDish, CMSSection } from '../_models';
import { Member } from '../_models';
import { Restaurant } from '../_models';
import { HttpClient } from '@angular/common/http';
import { AppService } from './app.service';

@Injectable()

export class CMSService {

  authToken;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    private config: AppConfig) {
    this.appService.authToken.subscribe(token => {
      this.authToken = token;
    });
  }

  // elements
  getElement(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementget',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getElementClass(restaurant_id: string, cms_element_class: string, get_default: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementgetclass',
      {
        restaurant_id: restaurant_id,
        cms_element_class: cms_element_class,
        get_default: get_default,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getElementByID(cms_element_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementgetbyid',
      {
        cms_element_id: cms_element_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createElement(cms_element: CMSElement) {
    return this.http.post(this.config.apiUrl + '/cms/elementcreate',
      {
        cms_element: cms_element,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateElement(cms_element: CMSElement) {
    return this.http.post(this.config.apiUrl + '/cms/elementupdate',
      {
        cms_element: cms_element,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  defaultElement(cms_element_id: string, cms_element_default: Boolean) {
    return this.http.post(this.config.apiUrl + '/cms/elementdefault',
      {
        cms_element_id: cms_element_id,
        cms_element_default: cms_element_default,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteElement(cms_element_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementdelete',
      {
        cms_element_id: cms_element_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  // times
  getTimes(restaurant_id: string) {
    // console.log('IN getTimes IN CMS SERVICE ' + restaurant_id);
    return this.http.post(this.config.apiUrl + '/cms/timeget',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getTimeChecking() {
    return this.http.post(this.config.apiUrl + '/cms/timegetchecking',
      {
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createTime(cms_time: CMSTime) {
    return this.http.post(this.config.apiUrl + '/cms/timecreate',
      {
        cms_time: cms_time,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createTimes(cms_times: [CMSTime]) {
    return this.http.post(this.config.apiUrl + '/cms/timescreate',
      {
        cms_times: cms_times,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createNewTimes(cms_times: [CMSTime]) {
    return this.http.post(this.config.apiUrl + '/cms/timescreatenew',
      {
        cms_times: cms_times,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateTime(cms_time: CMSTime) {
    return this.http.post(this.config.apiUrl + '/cms/timeupdate',
      {
        cms_time: cms_time,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateTimes(cms_times: [CMSTime], cms_notes: string) {
    return this.http.post(this.config.apiUrl + '/cms/timesupdate',
      {
        cms_times: cms_times,
        cms_notes: cms_notes,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteTime(cms_time_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/timedelete',
      {
        cms_time_id: cms_time_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  // attributes - different for french
  getAttributeTexts(country_code) {
    if (country_code === 'FR') {
      return this.http.post(this.config.apiUrl + '/cms/frenchattributetexts',
        { userCode: this.config.userAPICode, token: this.authToken });
    } else {
      return this.http.post(this.config.apiUrl + '/cms/attributetexts',
        {userCode: this.config.userAPICode, token: this.authToken});
    }
  }

  getAttributes(restaurant_id: string, country_code: string) {
    return this.http.post(this.config.apiUrl + '/cms/attributeget',
      {
        restaurant_id: restaurant_id,
        country_code: country_code,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createAttribute(cms_attribute: CMSAttribute) {
    return this.http.post(this.config.apiUrl + '/cms/attributecreate',
      {
        cms_attribute: cms_attribute,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateAttribute(cms_attribute: any) {
    return this.http.post(this.config.apiUrl + '/cms/attributeupdate',
      {
        cms_attribute: cms_attribute,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateAttributes(restaurant_id: string, cms_features: any, cms_keywords: any) {
    return this.http.post(this.config.apiUrl + '/cms/attributesupdate',
      {
        restaurant_id: restaurant_id,
        cms_features: cms_features,
        cms_keywords: cms_keywords,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteAttribute(cms_attribute_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/attributedelete',
      {
        cms_attribute_id: cms_attribute_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  // meals
  getMeals(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/mealget',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createMeal(cms_meal: CMSMeal) {
    return this.http.post(this.config.apiUrl + '/cms/mealcreate',
      {
        cms_meal: cms_meal,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateMeal(cms_meal: CMSMeal) {
    return this.http.post(this.config.apiUrl + '/cms/mealupdate',
      {
        cms_meal: cms_meal,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteMeal(cms_meal_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/mealdelete',
      {
        cms_meal_id: cms_meal_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  // descriptions
  getDescriptions(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/descriptionget',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createDescription(cms_description: CMSDescription) {
    return this.http.post(this.config.apiUrl + '/cms/descriptioncreate',
      {
        cms_description: cms_description,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateDescription(cms_description: CMSDescription) {
    return this.http.post(this.config.apiUrl + '/cms/descriptionupdate',
      {
        cms_description: cms_description,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteDescription(cms_description_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/descriptiondelete',
      {
        cms_description_id: cms_description_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  // dishes
  getDishes(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/dishget',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createDish(cms_dish: CMSDish) {
    return this.http.post(this.config.apiUrl + '/cms/dishcreate',
      {
        cms_dish: cms_dish,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateDish(cms_dish: CMSDish) {
    return this.http.post(this.config.apiUrl + '/cms/dishupdate',
      {
        cms_dish: cms_dish,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteDish(cms_dish_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/dishdelete',
      {
        cms_dish_id: cms_dish_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getSections(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/sectionget',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createSection(cms_section: CMSSection) {
    return this.http.post(this.config.apiUrl + '/cms/sectioncreate',
      {
        cms_section: cms_section,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateSection(cms_section: CMSSection) {
    return this.http.post(this.config.apiUrl + '/cms/sectionupdate',
      {
        cms_section: cms_section,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  deleteSection(cms_section_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/sectiondelete',
      {
        cms_section_id: cms_section_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getHelp(cms_help_keyword: string) {
    return this.http.post(this.config.apiUrl + '/cms/gethelp',
      {
        cms_help_keyword: cms_help_keyword,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendRestaurantChanges(member_first_name: string, member_last_name: string, member_email: string,
                        restaurant_name: string, changes: any) {
    return this.http.post(this.config.apiUrl + '/cms/sendrestaurantchanges',
      {
        company_prefix: this.config.brand.prefix,
        member_first_name: member_first_name,
        member_last_name: member_last_name,
        member_email: member_email,
        restaurant_name: restaurant_name,
        changes: changes,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendRestaurantValidation(member: Member, restaurant: Restaurant, changes: any) {
    return this.http.post(this.config.apiUrl + '/cms/sendrestaurantvalidation',
      {
        company_prefix: this.config.brand.prefix,
        member: member,
        restaurant: restaurant,
        changes: changes,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getSPWTemplate(restaurant_id: string) {
    console.log('ID', restaurant_id);
    return this.http.post(this.config.apiUrl + '/cms/setspwtemplate',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  checkSPW(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/spw/checkSPW',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  previewSPW(restaurant_id: string, restaurant_number: string, production: Boolean, check_only: Boolean) {
    return this.http.post(this.config.apiUrl + '/cms/previewSPW',
      {
        restaurant_id: restaurant_id,
        restaurant_number: restaurant_number,
        production: production,
        check_only: check_only,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateCoordinates(restaurant_id: string, restaurant_lat: number, restaurant_lng: number) {
    return this.http.post(this.config.apiUrl + '/cms/coordinatesupdate',
      {
        restaurant_id: restaurant_id,
        restaurant_lat: restaurant_lat,
        restaurant_lng: restaurant_lng,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendVerificationEmail(restaurantname: string, restaurantcode: string, restaurantemail: string, memberfullname: string) {
    return this.http.post(this.config.apiUrl + '/cms/sendverificationemail',
      {
        company_prefix: this.config.brand.prefix,
        restaurant_name: restaurantname,
        restaurant_number: restaurantcode,
        restaurant_email: restaurantemail,
        member_fullname: memberfullname,
        userCode: this.config.userAPICode,
        token: this.authToken });
  }

  sendOfferRequestToAffiliateEmail(obj: any) {
    return this.http.post(this.config.apiUrl + '/cms/sendofferrequesttoaffiliate',
      {
        affiliate_offer: obj.affiliate_offer,
        affiliate_email: obj.affiliate_email,
        affiliate_name: obj.affiliate_name,
        member_id: obj.member_id,
        member_first_name: obj.member_first_name,
        member_last_name: obj.member_last_name,
        member_email: obj.member_email,
        // admin_fullname: localStorage.getItem('rd_username'),
        company_prefix: this.config.brand.prefix,
        email_language: localStorage.getItem('rd_language'),
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  sendOfferConfirmation(obj: any, member: any) {
    return this.http.post(this.config.apiUrl + '/cms/sendofferconfirmation',
      {
        affiliate_name: obj.affiliate_name,
        affiliate_contact_message: obj.affiliate_contact_message,
        restaurant_name: obj.restaurant_name,
        restaurant_email: member.member_email,
        restaurant_number: obj.restaurant_number,
        company_prefix: this.config.brand.prefix,
        email_language: localStorage.getItem('rd_language'),
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  getLastUpdatedRecord(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/getlastupdatedrecord',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  createLastUpdatedRecord(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/createlastupdatedrecord',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  updateLastCreatedField(restaurant_id: number, last_updated_field: string) {
    return this.http.post(this.config.apiUrl + '/cms/updatelastupdatedfield',
      {
        restaurant_id: restaurant_id,
        last_updated_field: last_updated_field,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

  resetLastUpdatedField(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/resetlastupdatedfield',
      {
        restaurant_id: restaurant_id,
        userCode: this.config.userAPICode,
        token: this.authToken
      });
  }

}

