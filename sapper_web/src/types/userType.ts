export interface LoginData {
  username: string;
  password: string;
  captcha: string;
  captcha_id:string;
}

export interface JxnuLoginData {
  token: string;
  iv: string;
}

export interface LoginRes {
  access_token: string;
  user: UserInfo;
}

export interface CaptchaRes {
  image_type: string;
  image: string;
  captcha_id:string;
}

export interface RegisterData {
  username: string;
  password: string;
  nickname: string;
  email: string;
  captcha: string;
  captcha_id:string;
}

export interface RegisterRes {
  data: string;
  msg: string;
}


export type UserInfo = {
  id: number;
  uuid: string;
  username: string;
  avatar: string;
  nickname: string
}

export interface UserState {
  user: UserInfo | null;
  captcha: string;
  captcha_id:string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface SysUserNoRelationRes {
  id: number;
  uuid: string;
  avatar?: string;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  status: number;
  is_superuser: boolean;
  is_staff: boolean;
  is_multi_login: boolean;
  join_time: string;
  last_login_time: string;
}

export interface SysUserParams {
  dept?: number;
  username?: string;
  phone?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface SysUserAvatarReq {
  url: string;
}

export interface SysUserInfoReq {
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
}

export interface SysUserAddReq {
  username: string;
  password: string;
  email: string;
}

export interface UserAddAgentsReq {
  agent_uuids: string[];
}
