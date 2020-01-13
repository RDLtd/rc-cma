export class CMSElement {
  cms_element_id: string;
  cms_element_restaurant_id: string;
  cms_element_class: string;
  cms_element_class_sequence: string;
  cms_element_title: string;
  cms_element_caption: string;
  cms_element_text: string;
  cms_element_image_path: string;
  cms_element_active: boolean;
  cms_element_live_from: string;
  cms_element_live_from_show: string;
  cms_element_live_to: string;
  cms_element_live_to_show: string;
  cms_element_created_on: string;
  cms_element_created_by: string;
  cms_element_approved_on: string;
  cms_element_approved_by: string;
  cms_element_last_update: string;
  cms_element_original_filename: string;
  cms_element_default: boolean;
}

export class CMSTime {
  cms_time_id: string;
  cms_time_restaurant_id: string;
  cms_time_day_of_week: string;
  cms_time_hours: string;
  cms_time_tag: string;
  cms_time_live_from: string;
  cms_time_live_to: string;
  cms_time_created_on: string;
  cms_time_created_by: string;
  cms_time_last_update: string;
  closed: string;
  session: {
    open: string;
    close: string;
  };
}

export class CMSAttribute {
  cms_attribute_id: string;
  cms_attribute_restaurant_id: string;
  cms_attribute_state: string;
  cms_attribute_additional: string;
  cms_attribute_created_on: string;
  cms_attribute_created_by: string;
  cms_attribute_last_update: string;
}

export class CMSAttributeDisplay {
  checked: boolean;
  text: string;
}

export class CMSMeal {
  cms_meal_id: string;
  cms_meal_restaurant_id: string;
  cms_meal_brunch: string;
  cms_meal_breakfast: string;
  cms_meal_lunch: string;
  cms_meal_dinner: string;
  cms_meal_created_on: string;
  cms_meal_created_by: string;
  cms_meal_last_update: string;
}

export class CMSDescription {
  cms_description_id: string;
  cms_description_restaurant_id: string;
  cms_description_title: string;
  cms_description_strap_line: string;
  cms_description_one_sentence: string;
  cms_description_one_paragraph: string;
  cms_description_long: string;
  cms_description_private: string;
  cms_description_group: string;
  cms_description_menus_overview: string;
  cms_description_car_parking: string;
  cms_description_public_transport: string;
  cms_description_created_on: string;
  cms_description_created_by: string;
  cms_description_last_updated: string;
  cms_description_reservation_info: string;
  cms_description_booking_provider: string;
  cms_description_booking_rest_id: string;
  cms_booking_max_covers: number;
  cms_booking_max_advance_days: number;
}

export class CMSDish {
  cms_dish_id: number;
  cms_dish_idx: number;
  cms_dish_restaurant_id: number;
  cms_dish_section_id: number;
  cms_dish_name: string;
  cms_dish_desc: string;
  cms_dish_price: string;
  cms_dish_vegetarian: number;
  cms_dish_vegan: number;
  cms_dish_glutenfree: number;
  cms_dish_created_on: string;
  cms_dish_created_by: string;
  cms_dish_last_updated: string;
}


export class CMSSection {
  cms_section_id: number;
  cms_section_restaurant_id: number;
  cms_section_desc_1: string;
  cms_section_desc_2: string;
  cms_section_desc_3: string;
  cms_section_created_on: string;
  cms_section_created_by: string;
  cms_section_last_updated: string;
}

