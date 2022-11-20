export interface SubscribeInterface {
  total_paid: number;
  school_id: string;
}

export interface CreateSchoolInterface {
  school_name: string;
  school_acronym: string;
  school_domain?: string;
  secretary_email: string;
}

export interface Subscription {
  subscription_id: string;
  number_of_apis: number;
  total_paid: number;
  unit_price: number;
  subscribed_at: Date;
  school_id: string;
}

export interface SchoolInterface {
  school_name: string;
  school_code: string;
  school_acronym: string;
  school_domain?: string;
  api_key: string;
  api_test_key: string;
  api_calls_used: number;
  api_calls_left: number;
  test_api_calls_left: number;
}
