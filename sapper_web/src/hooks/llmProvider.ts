import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
    fetchLLMProviderList,
    fetchLLMProviderDetail,
    createLLMProvider,
    updateLLMProvider,
    deleteLLMProvider
} from '../service/llmProviderService';
import { RootState, AppDispatch } from '../stores';
import {resetLLMProviderInfo, setLLMProviderInfo, setLLMProviderStateInfo} from '../stores/llmProviderSlice';
import {LLMProviderCreateReq, LLMProviderDetail, LLMProviderState, LLMProviderUpdateReq, GetLLMProviderListParam} from "../types/llmProviderType";


export function useDispatchLLMProvider() {
    const dispatch = useDispatch<AppDispatch>();

    // Get LLMProvider list (pagination)
    const getLLMProviderList = useCallback((params?: GetLLMProviderListParam) => {
        return dispatch(fetchLLMProviderList(params));
    }, [dispatch]);

    // Get LLMProvider details
    const getLLMProviderDetail = useCallback((llmProviderId: number) => {
        return dispatch(fetchLLMProviderDetail(llmProviderId));
    }, [dispatch]);

    // Create a new LLMProvider
    const addLLMProvider = useCallback((llmProviderData: LLMProviderCreateReq) => {
        return dispatch(createLLMProvider(llmProviderData));
    }, [dispatch]);

    // Update LLMProvider information
    const updateLLMProviderInfo = useCallback((providerId: number, data: LLMProviderUpdateReq) => {
        return dispatch(updateLLMProvider({ providerId, data }));
    }, [dispatch]);

    // Delete LLMProviders
    const removeLLMProvider = useCallback((pk: number) => {
        return dispatch(deleteLLMProvider(pk));
    }, [dispatch]);

    // Set partial LLMProvider info (partial update)
    const setLLMProviderPartialInfo = useCallback((llmProviderInfo: Partial<LLMProviderDetail>) => {
        dispatch(setLLMProviderInfo(llmProviderInfo));
    }, [dispatch]);

    // Reset LLMProvider info
    const resetLLMProvider = useCallback(() => {
        dispatch(resetLLMProviderInfo());
    }, [dispatch]);

    // Reset Compile info
    const setLLMProviderStatePartialInfo = useCallback((llmProviderStateInfo: Partial<LLMProviderState>) => {
        dispatch(setLLMProviderStateInfo(llmProviderStateInfo));
    }, [dispatch]);

    return {
        getLLMProviderList,
        getLLMProviderDetail,
        addLLMProvider,
        updateLLMProviderInfo,
        removeLLMProvider,
        setLLMProviderPartialInfo,
        resetLLMProvider,
        setLLMProviderStatePartialInfo
    };
}

// Create a typed useSelector hook
export const useLLMProviderSelector: TypedUseSelectorHook<RootState> = useSelector;
