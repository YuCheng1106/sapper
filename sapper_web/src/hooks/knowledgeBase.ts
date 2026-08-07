import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
    fetchAllKnowledgeBases,
    fetchKnowledgeBaseList,
    fetchKnowledgeBaseDetail,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase
} from '../service/knowledgeBaseService';
import { RootState, AppDispatch } from '../stores';
import {resetKnowledgeBaseInfo, setKnowledgeBaseInfo, setKnowledgeBaseStateInfo} from '../stores/knowledgeBaseSlice';
import {KnowledgeBaseCreateReq, KnowledgeBaseDetail, KnowledgeBaseState, KnowledgeBaseUpdateReq, GetKnowledgeBaseListParam} from "../types/knowledgeBaseType";


export function useDispatchKnowledgeBase() {
    const dispatch = useDispatch<AppDispatch>();

    // Get all KnowledgeBases
    const getAllKnowledgeBases = useCallback(() => {
        return dispatch(fetchAllKnowledgeBases());
    }, [dispatch]);

    // Get KnowledgeBase list (pagination)
    const getKnowledgeBaseList = useCallback((params?: GetKnowledgeBaseListParam) => {
        return dispatch(fetchKnowledgeBaseList(params));
    }, [dispatch]);

    // Get KnowledgeBase details
    const getKnowledgeBaseDetail = useCallback((knowledgeBaseUuid: string) => {
        return dispatch(fetchKnowledgeBaseDetail(knowledgeBaseUuid));
    }, [dispatch]);

    // Create a new KnowledgeBase
    const addKnowledgeBase = useCallback((knowledgeBaseData: KnowledgeBaseCreateReq) => {
        return dispatch(createKnowledgeBase(knowledgeBaseData));
    }, [dispatch]);

    // Update KnowledgeBase information
    const updateKnowledgeBaseInfo = useCallback((knowledgeBaseUuid: string, data: KnowledgeBaseUpdateReq) => {
        return dispatch(updateKnowledgeBase({ knowledgeBaseUuid, data }));
    }, [dispatch]);

    // Delete KnowledgeBases
    const removeKnowledgeBase = useCallback((pk: number) => {
        return dispatch(deleteKnowledgeBase(pk));
    }, [dispatch]);

    // Set partial KnowledgeBase info (partial update)
    const setKnowledgeBasePartialInfo = useCallback((knowledgeBaseInfo: Partial<KnowledgeBaseDetail>) => {
        dispatch(setKnowledgeBaseInfo(knowledgeBaseInfo));
    }, [dispatch]);

    // Reset KnowledgeBase info
    const resetKnowledgeBase = useCallback(() => {
        dispatch(resetKnowledgeBaseInfo());
    }, [dispatch]);

    // Reset Compile info
    const setKnowledgeBaseStatePartialInfo = useCallback((knowledgeBaseStateInfo: Partial<KnowledgeBaseState>) => {
        dispatch(setKnowledgeBaseStateInfo(knowledgeBaseStateInfo));
    }, [dispatch]);

    return {
        getAllKnowledgeBases,
        getKnowledgeBaseList,
        getKnowledgeBaseDetail,
        addKnowledgeBase,
        updateKnowledgeBaseInfo,
        removeKnowledgeBase,
        setKnowledgeBasePartialInfo,
        resetKnowledgeBase,
        setKnowledgeBaseStatePartialInfo
    };
}

// Create a typed useSelector hook
export const useKnowledgeBaseSelector: TypedUseSelectorHook<RootState> = useSelector;
