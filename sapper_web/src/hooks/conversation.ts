import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
    fetchAllConversations,
    fetchConversationList,
    fetchConversationDetail,
    createConversation,
    updateConversation,
    deleteConversation, generateAnswer,
} from '../service/conversationService';
import { RootState, AppDispatch } from '../stores';
import { resetConversationInfo, setConversationInfo, setConversationStateInfo } from '../stores/conversationSlice.ts';
import {
    ConversationCreateReq,
    ConversationDetail, ConversationState,
    ConversationUpdateReq, GenerateAnswerParam,
    GetAllConversationParam,
    GetConversationListParam, MessageContent
} from "../types/conversationType.ts";


export function useDispatchConversation() {
    const dispatch = useDispatch<AppDispatch>();

    // Get all Conversations
    const getAllConversations = useCallback((param: GetAllConversationParam) => {
        return dispatch(fetchAllConversations(param));
    }, [dispatch]);

    // Get Conversation list (pagination)
    const getConversationList = useCallback((agent_uuid: string, params?: GetConversationListParam) => {
        return dispatch(fetchConversationList({agent_uuid, params}));
    }, [dispatch]);

    // Get Conversation details
    const getConversationDetail = useCallback((conversationId: string, query: null | MessageContent[] = null) => {
        return dispatch(fetchConversationDetail({conversationId, query}));
    }, [dispatch]);

    // Create a new Conversation
    const addConversation = useCallback((conversationData: ConversationCreateReq) => {
        return dispatch(createConversation(conversationData));
    }, [dispatch]);

    // Update Conversation information
    const updateConversationInfo = useCallback((conversationUuid: string, data: ConversationUpdateReq) => {
        return dispatch(updateConversation({ conversationUuid, data }));
    }, [dispatch]);

    // Delete Conversations
    const removeConversation = useCallback((conversation_id: number) => {
        return dispatch(deleteConversation(conversation_id));
    }, [dispatch]);

    const generateAgentAnswer = useCallback((uuid: string, data: GenerateAnswerParam, controller: AbortController) => {
        return dispatch(generateAnswer({uuid, data, controller}));
    }, [dispatch]);

    // Set partial Conversation info (partial update)
    const setConversationPartialInfo = useCallback((conversationInfo: Partial<ConversationDetail>) => {
        dispatch(setConversationInfo(conversationInfo));
    }, [dispatch]);

    // Reset Conversation info
    const resetConversation = useCallback(() => {
        dispatch(resetConversationInfo());
    }, [dispatch]);

    // Reset Compile info
    const setConversationStatePartialInfo = useCallback((stateInfo: Partial<ConversationState>) => {
        dispatch(setConversationStateInfo(stateInfo));
    }, [dispatch]);

    return {
        getAllConversations,
        getConversationList,
        getConversationDetail,
        addConversation,
        updateConversationInfo,
        removeConversation,
        generateAgentAnswer,
        setConversationPartialInfo,
        resetConversation,
        setConversationStatePartialInfo
    };
}

// Create a typed useSelector hook
export const useConversationSelector: TypedUseSelectorHook<RootState> = useSelector;
