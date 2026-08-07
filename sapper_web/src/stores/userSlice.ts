import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    logout,
    fetchCaptcha,
    fetchUserInfo, loginUser, addUserThunk, jxnuLoginUser
} from '../service/userService';
import { setToken, clearToken } from '../utils/auth';
import {UserInfo, UserState} from "../types/userType";
import {jxnuLogin} from "../api/auth";

const initialState: UserState = {
    user: null,
    captcha: '',
	captcha_id: '',
    status: 'idle',
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        // Reset announcement information
        resetUserInfo: (state) => {
            state.user = null;
            state.captcha = '';
			state.captcha_id = '';
            state.status = 'idle';
            state.error = null;
        },
        // Set partial announcement information
        setUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        // Handle login
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                setToken(action.payload.access_token);
                state.user = action.payload.user;
                window.location.href = '/workspace/agent';
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Handle login
        builder
            .addCase(jxnuLoginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(jxnuLoginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                setToken(action.payload.access_token);
                state.user = action.payload.user;
                // window.location.href = '/workspace/agent';
            })
            .addCase(jxnuLoginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Handle logout
        builder
            .addCase(logout.fulfilled, (state) => {
                state.status = 'succeeded';
                state = initialState;
                clearToken();
            });

        // Handle captcha fetching
        builder
            .addCase(fetchCaptcha.fulfilled, (state, action) => {
                state.captcha = `data:image/png;base64, ${action.payload.image}`;
				state.captcha_id = `${action.payload.captcha_id}`;
                state.status = 'succeeded';
            })
            .addCase(fetchCaptcha.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Handle fetching user info
        builder
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload
            })
            .addCase(fetchUserInfo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Add user agent
        builder
            .addCase(addUserThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addUserThunk.fulfilled, (state) => {
                state.status = 'succeeded';
                window.location.href = '/login';
            })
            .addCase(addUserThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { resetUserInfo, setUserInfo } = userSlice.actions;

export default userSlice.reducer;
