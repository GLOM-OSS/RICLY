import { http } from '@ricly/axios';
import { Subject } from '@ricly/interfaces';

export async function importSubjects(file: File) {
  const formData = new FormData();
  formData.append('subjects', file);
  const { data } = await http.post(`/subjects/imports`, formData);
  return data;
}

export async function getSubjects(params?: {
  classroom_id?: string;
  teacher_id?: string;
}) {
  const { data } = await http.get<Subject[]>('/subjects/all', {
    params,
  });
  return data;
}

export async function getSubjectData(subject_id: string) {
  const { data } = await http.get<Subject>(`/subjects/${subject_id}`);
  return data;
}

export async function deleteSubjects(subjectIds: string[]) {
  const { data } = await http.delete(`/subjects/delete`, {
    params: { subjects: subjectIds },
  });
  return data;
}

export async function removeClassroomsFromSubjects(
  subject_id: string,
  classroomIds: string[]
) {
  const { data } = await http.delete(`/subjects/${subject_id}/classrooms`, {
    params: { classrooms: classroomIds },
  });
  return data;
}
