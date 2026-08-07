import axios from '../interceptor';
import {
    SysUserAddReq,
    SysUserAvatarReq,
    SysUserInfoReq,
    SysUserNoRelationRes, UserAddAgentsReq,
    UserInfo,
} from "../../types/userType";

// 添加智能体到用户
export function addUserAgentAPI(data: UserAddAgentsReq) {
    return axios.post(`/api/v1/sys/users/agent`, data);
}

export function getUserInfo(): Promise<UserInfo> {
    return axios.get('/api/v1/sys/users/me');
}

export function changeUserStatus(pk: number) {
    return axios.put(`/api/v1/sys/users/${pk}/status`);
}

export function changeUserSuper(pk: number) {
    return axios.put(`/api/v1/sys/users/${pk}/super`);
}

export function changeUserStaff(pk: number) {
    return axios.put(`/api/v1/sys/users/${pk}/staff`);
}

export function changeUserMulti(pk: number) {
    return axios.put(`/api/v1/sys/users/${pk}/multi`);
}

export function updateUserAvatar(usersname: string, data: SysUserAvatarReq) {
    return axios.put(`/api/v1/sys/users/${usersname}/avatar`, data);
}

export function updateUser(usersname: string, data: SysUserInfoReq) {
    return axios.put(`/api/v1/sys/users/${usersname}`, data);
}

export function addUser(data: SysUserAddReq): Promise<SysUserNoRelationRes> {
    return axios.post('/api/v1/sys/users/add', data);
}
export function deleteUser(usersname: string) {
    return axios.delete(`/api/v1/sys/users/${usersname}`);
}
