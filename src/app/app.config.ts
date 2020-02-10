import { environment } from '../environments/environment';

declare const require: any;

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
  public readonly session_timeout = 60; // 60 minutes
  public readonly session_countdown = 5; // 5 minutes check activity
  public readonly use_ip_location = true;

  public readonly geocoding_api = 'AIzaSyBN6LkgNpX8E8lpbHdlkJZ6SU5LILVHwMY';

  public readonly mailchimp_listid = '941da1d48e';
  public readonly mailchimp_listname = 'RC3';

  public readonly en_company = {
    rd_company_name: 'Restaurant Collective',
    rd_company_prefix: 'rc',
    rd_company_logo_root: 'rc-logo',
    rd_company_url: 'https://restaurantcollective.uk',
    rd_company_monthly_fee: '3.50',
    rd_company_annual_fee: '42.00',
    rd_company_currency_symbol: '£',
    rd_company_currency_code: 'GBP'
  };

  public readonly fr_company = {
    rd_company_name: 'Restaurateurs Indépendants',
    rd_company_prefix: 'ri',
    rd_company_logo_root: 'ri-logo',
    rd_company_url: 'https://restaurateurs-independants.fr',
    rd_company_monthly_fee: '4.00',
    rd_company_annual_fee: '48.00',
    rd_company_currency_symbol: '€',
    rd_company_currency_code: 'EUR'
  };

}
