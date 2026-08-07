// store/globalSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {GlobalState} from "../types/globalType";

// 定义初始全局状态
const initialState: GlobalState = {
  theme: 'light',
  language: 'en',
  notifications: [],
  selectedVariable: {
    type: '',
    data: ''
  },
  isVariableShow: false,
  generating: false,
};

// 创建全局 slice
const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setIsVariableShow(state){
      state.isVariableShow = !state.isVariableShow
    },
    setSelectedVariable(state, action){
      state.selectedVariable = {...action.payload}
      // state.selectedVariable.data = action.payload.data;
      state.isVariableShow = true
    },
    // 更新主题
    setTheme(state, action) {
      state.theme = action.payload;
    },
    // 更新语言
    setLanguage(state, action) {
      state.language = action.payload;
    },
    // 添加通知
    addNotification(state, action) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      state.notifications.push(action.payload);
    },
    setGenerating(state, action) {
      state.generating = action.payload;
    },
    // 清除所有通知
    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

// 导出 actions
export const { setTheme, setLanguage, addNotification, clearNotifications, setSelectedVariable, setIsVariableShow, setGenerating} = globalSlice.actions;

// 导出 reducer
export default globalSlice.reducer;
