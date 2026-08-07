import axios from '../interceptor'
import {CaptchaRes, JxnuLoginData, LoginData, LoginRes, RegisterData, RegisterRes} from "../../types/userType";


export function getCaptcha(): Promise<CaptchaRes> {
  return axios.get('/api/v1/auth/captcha');
}

export function userLogin(data: LoginData): Promise<LoginRes> {
  return axios.post('/api/v1/auth/login', data);
}

export function registerUser(data: RegisterData): Promise<RegisterRes> {
  return axios.post('/api/v1/auth/register', data);
}

export function userLogout() {
  return axios.post('/api/v1/auth/logout');
}

export function jxnuLogin(data:JxnuLoginData): Promise<LoginRes>  {
  return axios.post('/api/v1/oauth2/jxnu/jxnu-auth', data);
}

