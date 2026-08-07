import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
    fetchAllAgents,
    fetchAgentList,
    fetchAgentDetail,
    createAgent,
    updateAgent,
    deleteAgent,
    generateSplForm,
    generateSplChain,
    resetAgentPlugins,
    resetAgentKnowledgeBases,
    downloadAgent,
    fetchPublicAgentList, favoriteAgent, ratingAgent, fetchAgentWorkspaceDetail
} from '../service/agentService';
import { RootState, AppDispatch } from '../stores';
import {resetAgentInfo, setAgentInfo, setAgentStateInfo} from '../stores/agentSlice';
import {
    AgentCreateReq,
    AgentDetail,
    AgentState,
    AgentUpdateReq,
    GetAgentListParam
} from "../types/agentType";
import {PluginDetail} from "../types/pluginType";
import {KnowledgeBaseRes} from "../types/knowledgeBaseType";


export function useDispatchAgent() {
    const dispatch = useDispatch<AppDispatch>();

    // Get all Agents
    const getAllAgents = useCallback(() => {
        return dispatch(fetchAllAgents());
    }, [dispatch]);

    // Get all Agents
    const getAllPublicAgents = useCallback((params?: GetAgentListParam)=> {
        return dispatch(fetchPublicAgentList(params));
    }, [dispatch]);

    // Get Agent list (pagination)
    const getAgentList = useCallback((params?: GetAgentListParam) => {
        return dispatch(fetchAgentList(params));
    }, [dispatch]);

    // Get Agent details
    const getAgentDetail = useCallback((agentUuid: string) => {
        return dispatch(fetchAgentDetail(agentUuid));
    }, [dispatch]);

    const getAgentWorkspaceDetail = useCallback((agentUuid: string) => {
        return dispatch(fetchAgentWorkspaceDetail(agentUuid));
    }, [dispatch]);

    // Create a new Agent
    const addAgent = useCallback((agentData: AgentCreateReq) => {
        return dispatch(createAgent(agentData));
    }, [dispatch]);

    // Update Agent information
    const updateAgentInfo = useCallback((agentUuid: string, data: AgentUpdateReq) => {
        return dispatch(updateAgent({ agentUuid, data }));
    }, [dispatch]);

    // favorite Agent information
    const setAgentFavorite = useCallback((agentUuid: string, favorite: boolean) => {
        return dispatch(favoriteAgent({ agentUuid, favorite }));
    }, [dispatch]);

    // rating Agent information
    const setAgentRating = useCallback((agentUuid: string, rating_value: number) => {
        return dispatch(ratingAgent({ agentUuid, rating_value }));
    }, [dispatch]);

    // Download Agent information
    const downloadAgentInfo = useCallback((agentUuid: string) => {
        return dispatch(downloadAgent(agentUuid));
    }, [dispatch]);

    // Reset Agent plugin
    const resetPlugins = useCallback((agentUuid: string, data: PluginDetail[]) => {
        return dispatch(resetAgentPlugins({ agentUuid, data }));
    }, [dispatch]);

    // Reset Agent knowledge base
    const resetKnowledgeBases = useCallback((agentUuid: string, data: KnowledgeBaseRes[]) => {
        return dispatch(resetAgentKnowledgeBases({ agentUuid, data }));
    }, [dispatch]);

    // Delete Agents
    const removeAgent = useCallback((pk: number) => {
        return dispatch(deleteAgent(pk));
    }, [dispatch]);

    const generateAgentSplForm = useCallback((uuid: string) => {
        return dispatch(generateSplForm(uuid));
    }, [dispatch]);

    const generateAgentSplChain = useCallback((uuid: string) => {
        return dispatch(generateSplChain(uuid));
    }, [dispatch]);

    // Set partial Agent info (partial update)
    const setAgentPartialInfo = useCallback((agentInfo: Partial<AgentDetail>) => {
        dispatch(setAgentInfo(agentInfo));
    }, [dispatch]);

    // Reset Agent info
    const resetAgent = useCallback(() => {
        dispatch(resetAgentInfo());
    }, [dispatch]);

    // Reset Compile info
    const setAgentStatePartialInfo = useCallback((agentStateInfo: Partial<AgentState>) => {
        dispatch(setAgentStateInfo(agentStateInfo));
    }, [dispatch]);

    return {
        getAllAgents,
        getAllPublicAgents,
        getAgentList,
        getAgentDetail,
        addAgent,
        updateAgentInfo,
        downloadAgentInfo,
        resetPlugins,
        getAgentWorkspaceDetail,
        resetKnowledgeBases,
        removeAgent,
        generateAgentSplForm,
        generateAgentSplChain,
        setAgentPartialInfo,
        resetAgent,
        setAgentStatePartialInfo,
        setAgentFavorite,
        setAgentRating
    };
}

// Create a typed useSelector hook
export const useAgentSelector: TypedUseSelectorHook<RootState> = useSelector;
