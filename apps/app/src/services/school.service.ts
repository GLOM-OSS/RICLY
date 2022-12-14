import { http } from '@ricly/axios';
import { CreateSchoolInterface, SchoolInterface, UsageInterface } from '@ricly/interfaces';

export async function findSchools() {
  const { data } = await http.get<SchoolInterface[]>(`/schools/all`);
  return data;
}

export async function findSchoolData(school_code: string) {
  const { data } = await http.get<SchoolInterface>(`/schools/${school_code}`);
  return data;
}

export async function createNewSchool(newSchool: CreateSchoolInterface) {
  const { data } = await http.post<SchoolInterface>(`/schools/new`, newSchool);
  return data;
}

export async function removeSchool(school_code: string) {
  return http.delete(`/schools/${school_code}/delete`);
}

export async function updateSchoolData(
  school_code: string,
  newSchool: Partial<SchoolInterface>
) {
  return http.put(`/schools/${school_code}/edit`, newSchool);
}

export async function getApiUsageStats(school_code: string) {
  const { data } = await http.get<UsageInterface[]>(
    `/schools/${school_code}/api-usage`
  );
  return data;
}
