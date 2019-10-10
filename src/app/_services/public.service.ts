import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { SQLParameters } from '../_models';

@Injectable()

export class PublicService {

  constructor(private http: HttpClient, private config: AppConfig) { }

  // Administration
  getPublicAPIInfo(user_code, api_key) {
    return this.http.post(this.config.apiUrl + '/public/api_info',
      { user_code: user_code, api_key: api_key });
  }

  getPublicAPIData(user_code, api_key, start, stop) {
    return this.http.post(this.config.apiUrl + '/public/api_data',
      { user_code: user_code, api_key: api_key, start: start, stop: stop });
  }

  // Restaurants
  getPublicRestaurants(user_code, api_key, sql_parameters: SQLParameters) {
    return this.http.post(this.config.apiUrl + '/public/restaurants',
      { user_code: user_code, api_key: api_key, sql_parameters: sql_parameters });
  }

  // CMS
  getPublicElements(user_code, api_key, restaurant_id, cms_element_class: string, quality: string) {
    return this.http.post(this.config.apiUrl + '/public/cms/elements',
      { user_code: user_code, api_key: api_key, restaurant_id: restaurant_id,
        cms_element_class: cms_element_class, quality: quality });
  }

  getPublicTimes(user_code, api_key, restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/public/cms/times',
      { user_code: user_code, api_key: api_key, restaurant_id: restaurant_id });
  }

  getPublicAttributeTexts(user_code, api_key) {
    return this.http.post(this.config.apiUrl + '/public/cms/attributetexts',
      { user_code: user_code, api_key: api_key });
  }

  getPublicAttributes(user_code, api_key, restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/public/cms/attributes',
      { user_code: user_code, api_key: api_key, restaurant_id: restaurant_id });
  }

  getPublicMeals(user_code, api_key, restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/public/cms/meals',
      { user_code: user_code, api_key: api_key, restaurant_id: restaurant_id });
  }

  getPublicDescriptions(user_code, api_key, restaurant_id: string) {
    return this.http.post(this.config.apiUrl + '/public/cms/descriptions',
      { user_code: user_code, api_key: api_key, restaurant_id: restaurant_id });
  }

  setPublicCreateUser(user_code, api_key, user_name, user_role, user_telephone, user_email,
                      user_password, user_access_code, user_activation_email, user_language) {
    // PUBLIC API REQUIRED
    //      user_code (for RDL set to CF-418-Beta from form)
    //      api_key (for RDL set to 23424n1i2eb12gei12g4312be1l2bei12412e from form)
    // USER DATA
    //      user_name (one field with full name)
    //      user_role (will need to key some record data from this, so need to know drop-down options)
    //      user_telephone
    //      user_email
    //      user_password
    //      user_access_code (the restaurant number, will be blank for reg only)
    //      user_activation_email (where the invite was sent)
    // DERIVED DATA
    //      user_language (en or fr at this stage, will be set from specific translation version of form)
    return this.http.post(this.config.apiUrl + '/public/create_user',
      {
        user_code: user_code,
        api_key: api_key,
        user_name: user_name,
        user_role: user_role,
        user_telephone: user_telephone,
        user_email: user_email,
        user_password: user_password,
        user_access_code: user_access_code,
        user_activation_email: user_activation_email,
        user_language: user_language
      });
  }

  setPublicRegisterAssociate(user_code, api_key, restaurant_number: string) {
    return this.http.post(this.config.apiUrl + '/public/register_associate',
      { user_code: user_code, api_key: api_key, restaurant_number: restaurant_number });
  }

}

