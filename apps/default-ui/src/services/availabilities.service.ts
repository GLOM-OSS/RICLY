import { http } from '@ricly/axios';
import { Availability, Classroom, CreateAvailability, Teacher } from '@ricly/interfaces';

export async function getTeacherAvailabilities() {
  const { data } = await http.get<Availability[]>(`/availabilities/all`);
  return data;
}

export async function addNewAvailibilities(
  newAvailabilities: CreateAvailability
) {
  return http.post(`/availabilities/new`, newAvailabilities);
}

export async function deleteAvailabilities(availabilityIds: string[]) {
  return http.delete(`/availabilities/delete`, {
    params: { availabilities: availabilityIds },
  });
}

export async function getAvailableTeachers(classroom_id: string) {
  const { data } = await http.get<Teacher[]>(`/availabilities/teachers`, {
    params: { classroom_id },
  });
  return data;
}

export async function getCoordinatorClassrooms() {
  const { data } = await http.get<Classroom[]>(`/availabilities/classrooms`);
  return data;
}
