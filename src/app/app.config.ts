import { environment } from '../environments/environment';
import { Injectable } from "@angular/core";

declare const require: any;

@Injectable()
export class AppConfig {

  public readonly build = {
    version: require('../../package.json').version,
    name: require('../../package.json').name
  };

  // Should only need to switch here to change from local to Heroku server
  // public readonly apiUrl = 'http://localhost:4000';
  // public readonly apiUrl = 'https://rc-server-staging.herokuapp.com';
  // public readonly apiUrl = 'https://rc-server-prod.herokuapp.com';

  // update 05/09/18 to read apiURL from .env file
  // This is angular's equivalent! See the 'environments' folder
  // Build process should automatically detect the correct variables
  public readonly apiUrl = environment.API_URL;

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

  private brands = {
    rc: {
      name: 'Restaurant Collective',
      prefix: 'rc',
      logo: 'rc-logo',
      url: 'https://restaurantcollective.uk',
      email: {
        support: 'support@restaurantcollective.uk',
        curation: 'curation@restaurantcollective.uk'
      },
      fee: {
        month: '3.50',
        year: '42.00',
        yearIncVat: '50.40'
      },
      currency: {
        symbol: '£',
        code: 'GBP'
      },
      downloads: {
        terms: 'https://restaurantcollective.uk/downloads/RC-Terms.pdf',
        privacy: 'https://restaurantcollective.uk/downloads/RC-Privacy.pdf'
      }
    },
    ri: {
      name: 'Restaurateurs Indépendants',
      prefix: 'ri',
      logo: 'ri-logo',
      url: 'https://restaurateursindependants.com',
      email: {
        support: 'support@restaurateursindependants.com',
        curation: 'curation@restaurateursindependants.com'
      },
      fee: {
        month: '4.00',
        year: '48.00',
        yearIncVat: '57.60'
      },
      currency: {
        symbol: '€',
        code: 'EUR'
      },
      downloads: {
        terms: 'https://restaurateursindependants.com/downloads/RI-Terms.pdf',
        privacy: 'https://restaurateursindependants.com/downloads/RI-Privacy.pdf'
      }
    }
  };
  public readonly brand = this.brands[localStorage.getItem('rd_brand')];
}
