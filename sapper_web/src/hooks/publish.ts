import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
    fetchAllAgentPublishments,
    fetchAgentPublishmentList,
    fetchAgentPublishmentDetail,
    createAgentPublishment,
    updateAgentPublishment,
    deleteAgentPublishment
} from '../service/publishService';
import { RootState, AppDispatch } from '../stores';
import {resetAgentPublishmentInfo, setAgentPublishmentInfo, setAgentPublishmentStateInfo} from '../stores/publishSlice';
import {AgentPublishmentCreateReq, AgentPublishmentDetail, AgentPublishmentState, AgentPublishmentUpdateReq, GetAgentPublishmentListParam} from "../types/publishType.ts";


export function useDispatchAgentPublishment() {
    const dispatch = useDispatch<AppDispatch>();

    // Get all AgentPublishments
    const getAllAgentPublishments = useCallback(() => {
        return dispatch(fetchAllAgentPublishments());
    }, [dispatch]);

    // Get AgentPublishment list (pagination)
    const getAgentPublishmentList = useCallback((params?: GetAgentPublishmentListParam) => {
        return dispatch(fetchAgentPublishmentList(params));
    }, [dispatch]);

    // Get AgentPublishment details
    const getAgentPublishmentDetail = useCallback((knowledgeBaseUuid: string) => {
        return dispatch(fetchAgentPublishmentDetail(knowledgeBaseUuid));
    }, [dispatch]);

    // Create a new AgentPublishment
    const addAgentPublishment = useCallback((knowledgeBaseData: AgentPublishmentCreateReq) => {
        return dispatch(createAgentPublishment(knowledgeBaseData));
    }, [dispatch]);

    // Update AgentPublishment information
    const updateAgentPublishmentInfo = useCallback((publishUuid: string, data: AgentPublishmentUpdateReq) => {
        return dispatch(updateAgentPublishment({ publishUuid, data }));
    }, [dispatch]);

    // Delete AgentPublishments
    const removeAgentPublishment = useCallback((pk: number) => {
        return dispatch(deleteAgentPublishment(pk));
    }, [dispatch]);

    // Set partial AgentPublishment info (partial update)
    const setAgentPublishmentPartialInfo = useCallback((knowledgeBaseInfo: Partial<AgentPublishmentDetail>) => {
        dispatch(setAgentPublishmentInfo(knowledgeBaseInfo));
    }, [dispatch]);

    // Reset AgentPublishment info
    const resetAgentPublishment = useCallback(() => {
        dispatch(resetAgentPublishmentInfo());
    }, [dispatch]);

    // Reset Compile info
    const setAgentPublishmentStatePartialInfo = useCallback((knowledgeBaseStateInfo: Partial<AgentPublishmentState>) => {
        dispatch(setAgentPublishmentStateInfo(knowledgeBaseStateInfo));
    }, [dispatch]);

    return {
        getAllAgentPublishments,
        getAgentPublishmentList,
        getAgentPublishmentDetail,
        addAgentPublishment,
        updateAgentPublishmentInfo,
        removeAgentPublishment,
        setAgentPublishmentPartialInfo,
        resetAgentPublishment,
        setAgentPublishmentStatePartialInfo
    };
}

// Create a typed useSelector hook
export const useAgentPublishmentSelector: TypedUseSelectorHook<RootState> = useSelector;
