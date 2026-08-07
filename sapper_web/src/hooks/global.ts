// hooks/useGlobalState.js
import { useCallback } from 'react';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import { RootState, AppDispatch } from '../stores';
import {
  setTheme,
  setLanguage,
  addNotification,
  clearNotifications,
  setSelectedVariable,
  setIsVariableShow,
  setGenerating
} from '../stores/globalSlice';
import {Variable} from "../types/globalType";

// 自定义 hook 处理全局状态的 dispatch 操作
export function useDispatchGlobalState() {
  const dispatch = useDispatch<AppDispatch>();

  const changeIsVariableShow = useCallback(() => {
    dispatch(setIsVariableShow());
  }, [dispatch]);

  const changeSelectedVariable = useCallback((variable: Variable) => {
    dispatch(setSelectedVariable(variable));
  }, [dispatch]);

  // 更新主题
  const changeTheme = useCallback((theme: string) => {
    dispatch(setTheme(theme));
  }, [dispatch]);

  // 更新语言
  const changeLanguage = useCallback((language: string) => {
    dispatch(setLanguage(language));
  }, [dispatch]);

  // 添加通知
  const pushNotification = useCallback((message: Notification) => {
    dispatch(addNotification(message));
  }, [dispatch]);

  // 清除所有通知
  const resetNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // 清除所有通知
  const setSPLFormGenerating = useCallback((tag: boolean) => {
    dispatch(setGenerating(tag));
  }, [dispatch]);

  return {
    changeIsVariableShow,
    changeSelectedVariable,
    changeTheme,
    changeLanguage,
    pushNotification,
    resetNotifications,
    setSPLFormGenerating
  };
}

// 类型化 useSelector
export const useGlobalStateSelector: TypedUseSelectorHook<RootState> = useSelector;
