import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAllKnowledgeBases,
    fetchKnowledgeBaseList,
    fetchKnowledgeBaseDetail,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
} from '../service/knowledgeBaseService';

import {KnowledgeBaseDetail, KnowledgeBasePagination, KnowledgeBaseRes, KnowledgeBaseState} from "../types/knowledgeBaseType";

const initialState: KnowledgeBaseState = {
    knowledgeBases: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    knowledgeBaseDetail: null,
    status: 'idle',
    error: null,
};

// KnowledgeBase slice
const knowledgeBaseSlice = createSlice({
    name: 'knowledgeBase',
    initialState,
    reducers: {
        // Reset knowledgeBase information
        resetKnowledgeBaseInfo: (state) => {
            state.knowledgeBases = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.knowledgeBaseDetail = null;
            state.status = 'idle';
            state.error = null;
        },
        // Set partial knowledgeBase information
        setKnowledgeBaseInfo: (state, action: PayloadAction<Partial<KnowledgeBaseRes>>) => {
            if (state.knowledgeBaseDetail) {
                state.knowledgeBaseDetail = { ...state.knowledgeBaseDetail, ...action.payload };
            }
        },
        setKnowledgeBaseStateInfo: (state, action: PayloadAction<Partial<KnowledgeBaseState>>) => {
            Object.assign(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        // Fetch all knowledgeBases
        builder
            .addCase(fetchAllKnowledgeBases.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllKnowledgeBases.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.knowledgeBases.items = action.payload;
            })
            .addCase(fetchAllKnowledgeBases.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch knowledgeBase list (paginated)
        builder
            .addCase(fetchKnowledgeBaseList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchKnowledgeBaseList.fulfilled, (state, action: PayloadAction<KnowledgeBasePagination>) => {
                state.status = 'succeeded';
                state.knowledgeBases = action.payload;
            })
            .addCase(fetchKnowledgeBaseList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch knowledgeBase details
        builder
            .addCase(fetchKnowledgeBaseDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchKnowledgeBaseDetail.fulfilled, (state, action: PayloadAction<KnowledgeBaseDetail>) => {
                state.status = 'succeeded';
                state.knowledgeBaseDetail = action.payload;
            })
            .addCase(fetchKnowledgeBaseDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Create a new knowledgeBase
        builder
            .addCase(createKnowledgeBase.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createKnowledgeBase.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(createKnowledgeBase.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Update knowledgeBase information
        builder
            .addCase(updateKnowledgeBase.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateKnowledgeBase.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (state.knowledgeBaseDetail)
                    state.knowledgeBaseDetail = { ...state.knowledgeBaseDetail, ...action.payload };
                state.knowledgeBases.items = state.knowledgeBases.items.map(item =>
                    item.uuid === action.payload.uuid ? {...item, ...action.payload} : item
                );
            })
            .addCase(updateKnowledgeBase.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Delete knowledgeBases
        builder
            .addCase(deleteKnowledgeBase.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteKnowledgeBase.fulfilled, (state, action) => {
                state.status = 'succeeded';

                state.knowledgeBases.items = state.knowledgeBases.items.filter(
                    (knowledgeBase) => action.payload !== knowledgeBase.uuid
                );
            })
            .addCase(deleteKnowledgeBase.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const { resetKnowledgeBaseInfo, setKnowledgeBaseInfo, setKnowledgeBaseStateInfo} = knowledgeBaseSlice.actions;

// Export reducer
export default knowledgeBaseSlice.reducer;
