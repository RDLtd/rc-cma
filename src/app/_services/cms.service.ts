import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { CMSElement, CMSTime, CMSAttribute, CMSMeal, CMSDescription, CMSDish, CMSSection } from '../_models';
import { Member } from '../_models';
import { Restaurant } from '../_models';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()

export class CMSService {

  constructor(private http: HttpClient, private config: AppConfig) { }

  // elements
  getElement(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getElementClass(restaurant_id: string, cms_element_class: string, get_default: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementgetclass',
      { restaurant_id: restaurant_id, cms_element_class: cms_element_class, get_default: get_default,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  getElementByID(cms_element_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementgetbyid',
      { cms_element_id: cms_element_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createElement(cms_element: CMSElement) {
    return this.http.post(this.config.apiUrl + '/cms/elementcreate',
      { cms_element: cms_element, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateElement(cms_element: CMSElement) {
    return this.http.post(this.config.apiUrl + '/cms/elementupdate',
      { cms_element: cms_element, userCode: this.config.userAPICode, token: this.jwt() });
  }

  defaultElement(cms_element_id: string, cms_element_default: Boolean) {
    return this.http.post(this.config.apiUrl + '/cms/elementdefault',
      { cms_element_id: cms_element_id, cms_element_default: cms_element_default,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteElement(cms_element_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementdelete',
      { cms_element_id: cms_element_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  // times
  getTimes(restaurant_id: string) {
    // console.log('IN getTimes IN CMS SERVICE ' + restaurant_id);
    return this.http.post(this.config.apiUrl + '/cms/timeget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getTimeChecking() {
    return this.http.post(this.config.apiUrl + '/cms/timegetchecking',
      { userCode: this.config.userAPICode, token: this.jwt() });
  }

  createTime(cms_time: CMSTime) {
    return this.http.post(this.config.apiUrl + '/cms/timecreate',
      { cms_time: cms_time, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createTimes(cms_times: [CMSTime]) {
    return this.http.post(this.config.apiUrl + '/cms/timescreate',
      { cms_times: cms_times, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createNewTimes(cms_times: [CMSTime]) {
    return this.http.post(this.config.apiUrl + '/cms/timescreatenew',
      { cms_times: cms_times, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateTime(cms_time: CMSTime) {
    return this.http.post(this.config.apiUrl + '/cms/timeupdate',
      { cms_time: cms_time, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateTimes(cms_times: [CMSTime], cms_notes: string) {
    return this.http.post(this.config.apiUrl + '/cms/timesupdate',
      { cms_times: cms_times, cms_notes: cms_notes, userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteTime(cms_time_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/timedelete',
      { cms_time_id: cms_time_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  // attributes - different for french
  getAttributeTexts(country_code) {
    if (country_code === 'FR') {
      return this.http.post(this.config.apiUrl + '/cms/frenchattributetexts',
        { userCode: this.config.userAPICode, token: this.jwt() });
    } else {
      return this.http.post(this.config.apiUrl + '/cms/attributetexts',
        {userCode: this.config.userAPICode, token: this.jwt()});
    }
  }

  getAttributes(restaurant_id: string, country_code: string) {
    return this.http.post(this.config.apiUrl + '/cms/attributeget',
      { restaurant_id: restaurant_id, country_code: country_code, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createAttribute(cms_attribute: CMSAttribute) {
    return this.http.post(this.config.apiUrl + '/cms/attributecreate',
      { cms_attribute: cms_attribute, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateAttribute(cms_attribute: any) {
    return this.http.post(this.config.apiUrl + '/cms/attributeupdate',
      { cms_attribute: cms_attribute, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateAttributes(restaurant_id: string, cms_features: any, cms_keywords: any) {
    return this.http.post(this.config.apiUrl + '/cms/attributesupdate',
      { restaurant_id: restaurant_id, cms_features: cms_features,
        cms_keywords: cms_keywords, userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteAttribute(cms_attribute_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/attributedelete',
      { cms_attribute_id: cms_attribute_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  // meals
  getMeals(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/mealget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createMeal(cms_meal: CMSMeal) {
    return this.http.post(this.config.apiUrl + '/cms/mealcreate',
      { cms_meal: cms_meal, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateMeal(cms_meal: CMSMeal) {
    return this.http.post(this.config.apiUrl + '/cms/mealupdate',
      { cms_meal: cms_meal, userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteMeal(cms_meal_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/mealdelete',
      { cms_meal_id: cms_meal_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  // descriptions
  getDescriptions(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/descriptionget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createDescription(cms_description: CMSDescription) {
    return this.http.post(this.config.apiUrl + '/cms/descriptioncreate',
      { cms_description: cms_description, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateDescription(cms_description: CMSDescription) {
    return this.http.post(this.config.apiUrl + '/cms/descriptionupdate',
      { cms_description: cms_description, userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteDescription(cms_description_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/descriptiondelete',
      { cms_description_id: cms_description_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  // dishes
  getDishes(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/dishget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createDish(cms_dish: CMSDish) {
    return this.http.post(this.config.apiUrl + '/cms/dishcreate',
      { cms_dish: cms_dish, userCode: this.config.userAPICode, token: this.jwt()});
  }

  updateDish(cms_dish: CMSDish) {
    return this.http.post(this.config.apiUrl + '/cms/dishupdate',
      { cms_dish: cms_dish, userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteDish(cms_dish_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/dishdelete',
      { cms_dish_id: cms_dish_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getSections(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/sectionget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createSection(cms_section: CMSSection) {
    return this.http.post(this.config.apiUrl + '/cms/sectioncreate',
      { cms_section: cms_section, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateSection(cms_section: CMSSection) {
    return this.http.post(this.config.apiUrl + '/cms/sectionupdate',
      { cms_section: cms_section, userCode: this.config.userAPICode, token: this.jwt() });
  }

  deleteSection(cms_section_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/sectiondelete',
      { cms_section_id: cms_section_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  getHelp(cms_help_keyword: string) {
    return this.http.post(this.config.apiUrl + '/cms/gethelp',
      { cms_help_keyword: cms_help_keyword, userCode: this.config.userAPICode, token: this.jwt() });
  }

  sendRestaurantChanges(member: Member, restaurant: Restaurant, changes: any) {
    return this.http.post(this.config.apiUrl + '/cms/sendrestaurantchanges',
      { member: member, restaurant: restaurant, changes: changes,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  getSPWTemplate(restaurant_id: string) {
    console.log('ID', restaurant_id);
    return this.http.post(this.config.apiUrl + '/cms/setspwtemplate',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  previewSPW(restaurant_id: string, restaurant_number: string, production: Boolean, check_only: Boolean) {
    return this.http.post(this.config.apiUrl + '/cms/previewSPW',
      { restaurant_id: restaurant_id, restaurant_number: restaurant_number, production: production, check_only: check_only,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateCoordinates(restaurant_id: string, restaurant_lat: number, restaurant_lng: number) {
    return this.http.post(this.config.apiUrl + '/cms/coordinatesupdate',
      { restaurant_id: restaurant_id, restaurant_lat: restaurant_lat, restaurant_lng: restaurant_lng,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  sendVerificationEmail(restaurantname: string, restaurantcode: string, restaurantemail: string) {
    return this.http.post(this.config.apiUrl + '/cms/sendverificationemail',
      { restaurantname: restaurantname, restaurantcode: restaurantcode, restaurantemail: restaurantemail,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  getLastUpdatedRecord(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/getlastupdatedrecord',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  createLastUpdatedRecord(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/createlastupdatedrecord',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() });
  }

  updateLastCreatedField(restaurant_id: number, last_updated_field: string) {
    return this.http.post(this.config.apiUrl + '/cms/updatelastupdatedfield',
      { restaurant_id: restaurant_id, last_updated_field: last_updated_field,
        userCode: this.config.userAPICode, token: this.jwt() });
  }

  // Generate Token
  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const requestOptions = {
      params: new HttpParams()
    };
    requestOptions.params.set('apiCategory', 'Financial');

    if (currentUser && currentUser.token) {
      requestOptions.params.set('Authorization', 'Bearer ' + currentUser.token);
    } else {
      requestOptions.params.set('Authorization', 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge');
    }
    return requestOptions;
  }
}

