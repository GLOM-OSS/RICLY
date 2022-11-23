import { http } from '@ricly/axios';
import { Student } from '@ricly/interfaces';

export async function importStudents(file: File) {
  const formData = new FormData();
  formData.append('students', file);
  const { data } = await http.post(`/students/imports`, formData);
  return data;
}

export async function getStudents(params?: {
  classroom_id?: string;
  subject_id?: string;
}) {
  const { data } = await http.get<Student[]>('/students/all', {
    params,
  });
  return data;
}

export async function deleteStudents(studentIds: string[]) {
  const { data } = await http.delete(`/students/delete`, {
    params: { students: studentIds },
  });
  return data;
}
