import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { AppConfig } from '../app.config';
import { CMSElement, CMSTime, CMSAttribute, CMSMeal, CMSDescription, CMSDish, CMSSection } from '../_models/cms';
import { Member } from '../_models/index';
import { Restaurant } from '../_models/restaurant';

@Injectable()

export class CMSService {

  constructor(private http: Http, private config: AppConfig) { }

  // elements
  getElement(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  getElementClass(restaurant_id: string, cms_element_class: string, get_default: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementgetclass',
      { restaurant_id: restaurant_id, cms_element_class: cms_element_class, get_default: get_default,
        userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  getElementByID(cms_element_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementgetbyid',
      { cms_element_id: cms_element_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createElement(cms_element: CMSElement) {
    return this.http.post(this.config.apiUrl + '/cms/elementcreate',
      { cms_element: cms_element, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateElement(cms_element: CMSElement) {
    return this.http.post(this.config.apiUrl + '/cms/elementupdate',
      { cms_element: cms_element, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  defaultElement(cms_element_id: string, cms_element_default: Boolean) {
    return this.http.post(this.config.apiUrl + '/cms/elementdefault',
      { cms_element_id: cms_element_id, cms_element_default: cms_element_default,
        userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  deleteElement(cms_element_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/elementdelete',
      { cms_element_id: cms_element_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  // times
  getTimes(restaurant_id: string) {
    // console.log('IN getTimes IN CMS SERVICE ' + restaurant_id);
    return this.http.post(this.config.apiUrl + '/cms/timeget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  getTimeChecking() {
    return this.http.post(this.config.apiUrl + '/cms/timegetchecking',
      { userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createTime(cms_time: CMSTime) {
    return this.http.post(this.config.apiUrl + '/cms/timecreate',
      { cms_time: cms_time, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createTimes(cms_times: [CMSTime]) {
    return this.http.post(this.config.apiUrl + '/cms/timescreate',
      { cms_times: cms_times, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createNewTimes(cms_times: [CMSTime]) {
    return this.http.post(this.config.apiUrl + '/cms/timescreatenew',
      { cms_times: cms_times, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateTime(cms_time: CMSTime) {
    return this.http.post(this.config.apiUrl + '/cms/timeupdate',
      { cms_time: cms_time, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateTimes(cms_times: [CMSTime]) {
    return this.http.post(this.config.apiUrl + '/cms/timesupdate',
      { cms_times: cms_times, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  deleteTime(cms_time_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/timedelete',
      { cms_time_id: cms_time_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  // attributes - different for french
  getAttributeTexts(country_code) {
    if (country_code === 'FR') {
      return this.http.post(this.config.apiUrl + '/cms/frenchattributetexts',
        { userCode: this.config.userAPICode, token: this.jwt() })
        .map((response: Response) => response.json());
    } else {
      return this.http.post(this.config.apiUrl + '/cms/attributetexts',
        {userCode: this.config.userAPICode, token: this.jwt()})
        .map((response: Response) => response.json());
    }
  }

  getAttributes(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/attributeget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createAttribute(cms_attribute: CMSAttribute) {
    return this.http.post(this.config.apiUrl + '/cms/attributecreate',
      { cms_attribute: cms_attribute, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateAttribute(cms_attribute: any) {
    return this.http.post(this.config.apiUrl + '/cms/attributeupdate',
      { cms_attribute: cms_attribute, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateAttributes(restaurant_id: string, cms_features: any, cms_keywords: any) {
    return this.http.post(this.config.apiUrl + '/cms/attributesupdate',
      { restaurant_id: restaurant_id, cms_features: cms_features,
        cms_keywords: cms_keywords, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  deleteAttribute(cms_attribute_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/attributedelete',
      { cms_attribute_id: cms_attribute_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  // meals
  getMeals(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/mealget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createMeal(cms_meal: CMSMeal) {
    return this.http.post(this.config.apiUrl + '/cms/mealcreate',
      { cms_meal: cms_meal, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateMeal(cms_meal: CMSMeal) {
    return this.http.post(this.config.apiUrl + '/cms/mealupdate',
      { cms_meal: cms_meal, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  deleteMeal(cms_meal_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/mealdelete',
      { cms_meal_id: cms_meal_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  // descriptions
  getDescriptions(restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/descriptionget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createDescription(cms_description: CMSDescription) {
    return this.http.post(this.config.apiUrl + '/cms/descriptioncreate',
      { cms_description: cms_description, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateDescription(cms_description: CMSDescription) {
    return this.http.post(this.config.apiUrl + '/cms/descriptionupdate',
      { cms_description: cms_description, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  deleteDescription(cms_description_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/descriptiondelete',
      { cms_description_id: cms_description_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  // dishes
  getDishes(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/dishget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createDish(cms_dish: CMSDish) {
    return this.http.post(this.config.apiUrl + '/cms/dishcreate',
      { cms_dish: cms_dish, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateDish(cms_dish: CMSDish) {
    return this.http.post(this.config.apiUrl + '/cms/dishupdate',
      { cms_dish: cms_dish, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  deleteDish(cms_dish_id: string) {
    return this.http.post(this.config.apiUrl + '/cms/dishdelete',
      { cms_dish_id: cms_dish_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  getSections(restaurant_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/sectionget',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  createSection(cms_section: CMSSection) {
    return this.http.post(this.config.apiUrl + '/cms/sectioncreate',
      { cms_section: cms_section, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateSection(cms_section: CMSSection) {
    return this.http.post(this.config.apiUrl + '/cms/sectionupdate',
      { cms_section: cms_section, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  deleteSection(cms_section_id: number) {
    return this.http.post(this.config.apiUrl + '/cms/sectiondelete',
      { cms_section_id: cms_section_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  getHelp(cms_help_keyword: string) {
    return this.http.post(this.config.apiUrl + '/cms/gethelp',
      { cms_help_keyword: cms_help_keyword, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  sendRestaurantChanges(member: Member, restaurant: Restaurant, changes: any) {
    return this.http.post(this.config.apiUrl + '/cms/sendrestaurantchanges',
      { member: member, restaurant: restaurant, changes: changes,
        userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  getSPWTemplate(restaurant_id: string) {
    console.log('ID', restaurant_id);
    return this.http.post(this.config.apiUrl + '/cms/setspwtemplate',
      { restaurant_id: restaurant_id, userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  previewSPW(restaurant_id: string, restaurant_number: string, production: Boolean, check_only: Boolean) {
    return this.http.post(this.config.apiUrl + '/cms/previewSPW',
      { restaurant_id: restaurant_id, restaurant_number: restaurant_number, production: production, check_only: check_only,
        userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  updateCoordinates(restaurant_id: string, restaurant_lat: number, restaurant_lng: number) {
    return this.http.post(this.config.apiUrl + '/cms/coordinatesupdate',
      { restaurant_id: restaurant_id, restaurant_lat: restaurant_lat, restaurant_lng: restaurant_lng,
        userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  sendVerificationEmail(restaurantname: string, restaurantcode: string, restaurantemail: string) {
    return this.http.post(this.config.apiUrl + '/cms/sendverificationemail',
      { restaurantname: restaurantname, restaurantcode: restaurantcode, restaurantemail: restaurantemail,
        userCode: this.config.userAPICode, token: this.jwt() })
      .map((response: Response) => response.json());
  }

  // generate token
  private jwt() {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      const headers = new Headers({
        'Authorization': 'Bearer ' + currentUser.token,
        'apiCategory': 'CMS'
      });
      return new RequestOptions({ headers: headers });
    } else {
      // if there is no user, then we must invent a token
      const headers = new Headers({
        'Authorization': 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge',
        'apiCategory': 'CMS'
      });
      return new RequestOptions({ headers: headers });
    }
  }
}

