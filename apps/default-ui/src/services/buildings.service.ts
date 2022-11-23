import { http } from '@ricly/axios';
import { Building } from '@ricly/interfaces';

export async function importBuildings(file: File) {
  const formData = new FormData();
  formData.append('buildings', file, file.name);
  const { data } = await http.post(`/buildings/imports`, formData);
  return data;
}

export async function deleteBuildings(deleteBuildings: string[]) {
  console.log(deleteBuildings)
  const { data } = await http.delete(`/buildings/delete`, {
    params: { buildings: deleteBuildings },
  });
  return data;
}

export async function deleteHalls(deleteHalls: string[]) {
  const { data } = await http.delete(`/buildings/halls/delete`, {
    params: { halls: deleteHalls },
  });
  return data;
}

export async function getBuildings() {
  const { data } = await http.get<Building[]>('/buildings/all');
  return data;
}
