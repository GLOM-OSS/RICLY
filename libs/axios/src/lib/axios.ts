import { decrypt, encrypt } from '@ricly/encrypter';
import axios, { AxiosInstance } from 'axios';

export async function getCurrentIp() {
  const { data: ip_address } = await axios.get('https://api.ipify.org');
  return ip_address as string;
}

function axiosInstance(): AxiosInstance {
  const app_lang = 'ricly_lang';

  const axiosInstance = axios.create({
    baseURL: process.env['NX_API_BASE_URL'],
    headers: {
      'RICLY-API-KEY': process.env['NX_APP_API_KEY']
    },
    withCredentials: true,
  });
  axiosInstance.interceptors.request.use(
    (request) => {
      request = {
        ...request,
        headers: {
          ...request.headers,
          lang: localStorage.getItem(app_lang) || 'Fr',
        },
        params: request.params ? { data: encrypt(request.params) } : undefined,
        data: request.data ? { data: encrypt(request.data) } : undefined,
      };
      return request;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      response = {
        ...response,
        data: response.data ? decrypt(response.data): {},
      };
      return response;
    },
    (error) => {
      if (error.response?.status === 403 && location.pathname !== '/')
        location.href = '/';
      return Promise.reject(error.response?.data);
    }
  );

  return axiosInstance;
}

export const http = axiosInstance();
