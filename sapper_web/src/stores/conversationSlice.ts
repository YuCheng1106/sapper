import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAllConversations,
    fetchConversationList,
    fetchConversationDetail,
    createConversation,
    updateConversation,
    deleteConversation,
} from '../service/conversationService';

import {
    ConversationDetail,
    ConversationPagination,
    ConversationRes,
    ConversationState,
    SystemMessageContent
} from "../types/conversationType.ts";


const initialState: ConversationState = {
    conversations: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    isNewConversation: false,
    query: null,
    conversationDetail: null,
    status: 'idle',
    error: null,
};

// Conversation slice
const conversationSlice = createSlice({
    name: 'conversation',
    initialState,
    reducers: {
        // Reset conversation information
        resetConversationInfo: (state) => {
            state.conversationDetail = null;
            state.status = 'idle';
            state.error = null;
        },
        // Set partial conversation information
        setConversationInfo: (state, action: PayloadAction<Partial<ConversationRes>>) => {
            if (state.conversationDetail) {
                state.conversationDetail = { ...state.conversationDetail, ...action.payload };
            }else{
                state.conversationDetail = {
                    id: -1,
                    uuid: '',
                    creator_id: '',
                    agent_id: '',
                    created_time: '',
                    updated_time: '',
                    agent: null, chat_history: [], chat_parameters: {}, short_memory: '',long_memory: '', suggestions: [], name: '',
                    ...action.payload
                };
                state.conversationDetail = { ...state.conversationDetail, ...action.payload };
            }
        },
        setConversationStateInfo: (state, action: PayloadAction<Partial<ConversationState>>) => {
            Object.assign(state, action.payload);  // 或者直接: state.someProperty = action.payload.someValue;
        },
        // Set partial conversation information
        setConversationAnswerInfo: (state, action: PayloadAction<SystemMessageContent[]>) => {
            if (state.conversationDetail) {
                const len = state.conversationDetail?.chat_history.length;
                if (len && len >= 0) {
                    const prevMessage = state.conversationDetail?.chat_history[len - 1]
                    if (prevMessage?.role === 'system' && 'units' in prevMessage) {
                        prevMessage['units'] = action.payload;
                        state.conversationDetail.chat_history[len - 1] = prevMessage;
                    }else {
                        state.conversationDetail.chat_history.push({ role: "system", units: action.payload });
                    }
                }
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch all conversations
        builder
            .addCase(fetchAllConversations.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllConversations.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.conversations.items = action.payload;
            })
            .addCase(fetchAllConversations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch conversation list (paginated)
        builder
            .addCase(fetchConversationList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchConversationList.fulfilled, (state, action: PayloadAction<ConversationPagination>) => {
                state.status = 'succeeded';
                state.conversations = action.payload;
            })
            .addCase(fetchConversationList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch conversation details
        builder
            .addCase(fetchConversationDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchConversationDetail.fulfilled, (state, action: PayloadAction<ConversationDetail>) => {
                state.status = 'succeeded';
                state.conversationDetail = action.payload;
            })
            .addCase(fetchConversationDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Create a new conversation
        builder
            .addCase(createConversation.fulfilled, (state, action: PayloadAction<ConversationRes>) => {
                state.status = 'succeeded';
                state.conversations.items = [action.payload, ...state.conversations.items]
            })
            .addCase(createConversation.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Update conversation information
        builder
            .addCase(updateConversation.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const conversation_data = action.payload.data
                state.conversations.items = state.conversations.items.map(conversation =>
                    conversation.uuid === action.payload.conversationUuid ? {...conversation, ...conversation_data} : conversation
                );

                // Also update conversationDetail if it's the one being updated
                if (state.conversationDetail?.uuid === action.payload.conversationUuid) {
                    setConversationInfo(action.payload.data)
                }
            })
            .addCase(updateConversation.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Delete conversations
        builder
            .addCase(deleteConversation.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.conversations.items = state.conversations.items.filter(
                    (conversation) => action.payload !== conversation.id
                );
            })
            .addCase(deleteConversation.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

    },
});

// Export actions
export const { resetConversationInfo, setConversationInfo, setConversationAnswerInfo, setConversationStateInfo} = conversationSlice.actions;

// Export reducer
export default conversationSlice.reducer;
