import { http } from '@ricly/axios';
import { Availability, CreateAvailability } from '@ricly/interfaces';

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
