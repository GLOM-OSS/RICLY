import { http } from '@ricly/axios';
import { CreateSchoolInterface, SchoolInterface } from '@ricly/interfaces';

export async function findSchools() {
  const { data } = await http.get<SchoolInterface[]>(`/school/all`);
  return data;
}

export async function findSchoolProfile(school_code: string) {
  const { data } = await http.get<SchoolInterface>(`/school/${school_code}`);
  return data;
}

export async function createNewSchool(newSchool: CreateSchoolInterface) {
  alert(JSON.stringify(newSchool));
  const { data } = await http.post<SchoolInterface>(`/school/new`, newSchool);
  return data;
}

export async function removeSchool(school_code: string) {
  return http.delete(`/school/${school_code}/delete`);
}
