import {useCallback} from 'react';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {
    loginUser,
    logout,
    fetchUserInfo,
    fetchCaptcha,
    addUserThunk,
    updateUserThunk, userAddAgentsThunk, jxnuLoginUser,
} from '../service/userService';
import {JxnuLoginData, LoginData, RegisterData, SysUserInfoReq, UserAddAgentsReq, UserInfo} from '../types/userType';
import {AppDispatch, RootState} from "../stores";
import {resetUserInfo, setUserInfo} from "../stores/userSlice";


// Custom Hook to handle user-related dispatch actions
export function useDispatchUser() {
    const dispatch = useDispatch<AppDispatch>();

    // Login action
    const login = useCallback((loginData: LoginData) => {
        return dispatch(loginUser(loginData));
    }, [dispatch]);

    // Login action
    const jxnuLogin = useCallback((data: JxnuLoginData) => {
        return dispatch(jxnuLoginUser(data));
    }, [dispatch]);

    // Logout action
    const logoutUser = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    // Fetch user information
    const fetchUser = useCallback(() => {
        return dispatch(fetchUserInfo());
    }, [dispatch]);

    // Add a new user
    const addUser = useCallback((userData: RegisterData) => {
        return dispatch(addUserThunk(userData));
    }, [dispatch]);

    // Update existing user
    const updateUser = useCallback((username: string, data: SysUserInfoReq) => {
        return dispatch(updateUserThunk({username, data}));
    }, [dispatch]);


    // Set partial user info
    const setUser = useCallback((info: Partial<UserInfo>) => {
        dispatch(setUserInfo(info));
    }, [dispatch]);

    // Get captcha image
    const getCaptcha = useCallback(() => {
        return dispatch(fetchCaptcha());
    }, [dispatch]);

    // Reset user information
    const resetUser = useCallback(() => {
        dispatch(resetUserInfo());
    }, [dispatch]);

    // Reset user information
    const addUserAgent = useCallback((data: UserAddAgentsReq) => {
        return  dispatch(userAddAgentsThunk(data));
    }, [dispatch]);

    return {
        login,
        logoutUser,
        fetchUser,
        addUser,
        updateUser,
        setUser,
        resetUser,
        getCaptcha,
        addUserAgent,
        jxnuLogin
    };
}

// Create a typed useSelector hook
export const useUserSelector: TypedUseSelectorHook<RootState> = useSelector;
