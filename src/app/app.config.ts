import { environment } from '../environments/environment';
import { Injectable } from "@angular/core";


declare const require: any;

@Injectable()
export class AppConfig {

  public readonly build = {
    version: require('../../package.json').version,
    name: require('../../package.json').name
  };

  // App location
  appUrl = window.location.origin;


  // Should only need to switch here to change from local to Heroku server
  // public readonly apiUrl = 'http://localhost:4000';
  // public readonly apiUrl = 'https://rc-server-carter-mwkg7qc3nv9ak.herokuapp.com'
  public readonly apiUrl = 'https://rc-server-staging.herokuapp.com';
  // public readonly apiUrl = 'https://rc-server-prod.herokuapp.com';

  // This is Angular's equivalent! See the 'environments' folder
  // Build process should automatically detect the correct variables
  //public readonly apiUrl = environment.API_URL;

  public readonly sql_defaults = {
    where_field: 'restaurant_name',
    where_string: '',
    where_any_position: 'N',
    sort_field: 'restaurant_id',
    sort_direction: 'ASC',
    limit_number: '30',
    limit_index: '0'
  };

  public readonly userAPICode = 'RDL-dev';
  public readonly cloud_name = 'rdl';
  public readonly upload_preset = 'nozxac7z';
  public readonly restaurant_verification_days = 30;
  public readonly session_timeout = 60; // minutes
  public readonly session_countdown = 5; // minutes to check activity before timeout

  // public readonly use_ip_location = true;
  // public readonly geocoding_api = 'AIzaSyBN6LkgNpX8E8lpbHdlkJZ6SU5LILVHwMY';
  // public readonly mailchimp_listid = '941da1d48e';
  // public readonly mailchimp_listname = 'RC3';

  // Root domains
  tld = {
    rc: 'restaurantcollective.org.uk',
    ri: 'restaurateursindependants.fr'
  }

  private brands = {
    rc: {
      name: 'Restaurant Collective',
      prefix: 'rc',
      logo: 'rc-logo',
      url: `https://${this.tld.rc}`,
      joinUrl: `https://app.${this.tld.rc}/join`,
      spwDemoUrl: `https://example-restaurant.com/`,
      email: {
        support: `support@${this.tld.rc}`,
        curation: `curation@${this.tld.rc}`
      },
      products: {
        success_url: `${ this.appUrl }/signin`,
        cancel_url: `${ this.appUrl }/membership-options`,
      },
      currency: {
        symbol: '£',
        code: 'GBP'
      },
      downloads: {
        terms: `https://${this.tld.rc}/terms-conditions/`,
        privacy: `https://${this.tld.rc}/privacy-policy/`
      }
    },
    ri: {
      name: 'Restaurateurs Indépendants',
      prefix: 'ri',
      logo: 'ri-logo',
      url: `https://${this.tld.ri}`,
      joinUrl: `https://app.${this.tld.ri}/join`,
      spwDemoUrl: `https://example-restaurant.com/`,
      email: {
        support: `support@${this.tld.ri}`,
        curation: `curation@${this.tld.ri}`
      },
      products: {
        success_url: `${ this.appUrl }/signin`,
        cancel_url: `${ this.appUrl }/membership-options`,
      },
      currency: {
        symbol: '€',
        code: 'EUR'
      },
      downloads: {
        terms: `https://${this.tld.ri}/terms-conditions/`,
        privacy: `https://${this.tld.ri}/privacy-policy/`
      }
    }
  };
  public readonly brand = this.brands[localStorage.getItem('rd_brand')];
}
