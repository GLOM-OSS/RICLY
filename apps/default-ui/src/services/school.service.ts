import { http } from '@ricly/axios';
import { SchoolInterface, Subscription, UsageInterface } from '@ricly/interfaces';

export async function getSchoolProfile() {
  const { data } = await http.get<SchoolInterface>(`/school/profile`);
  return data;
}

export async function getSchoolSubscriptions(school_code: string) {
  const { data } = await http.get<Subscription[]>(`/subscriptions/all`, {
    params: { school_code },
  });

  return data;
}

export async function getApiUsageStats(school_code: string) {
  const { data } = await http.get<UsageInterface[]>(
    `/schools/${school_code}/api-usage`
  );
  return data;
}

