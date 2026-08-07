import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAllAgentPublishments,
    fetchAgentPublishmentList,
    fetchAgentPublishmentDetail,
    createAgentPublishment,
    // updateAgentPublishment,
    deleteAgentPublishment,
} from '../service/publishService';

import {AgentPublishmentDetail, AgentPublishmentPagination, AgentPublishmentRes, AgentPublishmentState} from "../types/publishType";

const initialState: AgentPublishmentState = {
    agentPublishments: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    agentPublishmentDetail: null,
    status: 'idle',
    error: null,
};

// AgentPublishment slice
const publishSlice = createSlice({
    name: 'publish',
    initialState,
    reducers: {
        // Reset publish information
        resetAgentPublishmentInfo: (state) => {
            state.agentPublishments = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.agentPublishmentDetail = null;
            state.status = 'idle';
            state.error = null;
        },
        // Set partial publish information
        setAgentPublishmentInfo: (state, action: PayloadAction<Partial<AgentPublishmentRes>>) => {
            if (state.agentPublishmentDetail) {
                state.agentPublishmentDetail = { ...state.agentPublishmentDetail, ...action.payload };
            }
        },
        setAgentPublishmentStateInfo: (state, action: PayloadAction<Partial<AgentPublishmentState>>) => {
            Object.assign(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        // Fetch all publishs
        builder
            .addCase(fetchAllAgentPublishments.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllAgentPublishments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agentPublishments = action.payload;
            })
            .addCase(fetchAllAgentPublishments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch publish list (paginated)
        builder
            .addCase(fetchAgentPublishmentList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAgentPublishmentList.fulfilled, (state, action: PayloadAction<AgentPublishmentPagination>) => {
                state.status = 'succeeded';
                state.agentPublishments = action.payload;
            })
            .addCase(fetchAgentPublishmentList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch publish details
        builder
            .addCase(fetchAgentPublishmentDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAgentPublishmentDetail.fulfilled, (state, action: PayloadAction<AgentPublishmentDetail>) => {
                state.status = 'succeeded';
                state.agentPublishmentDetail = action.payload;
            })
            .addCase(fetchAgentPublishmentDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Create a new publish
        builder
            .addCase(createAgentPublishment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createAgentPublishment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agentPublishments.items = [action.payload, ...state.agentPublishments.items]
            })
            .addCase(createAgentPublishment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Update publish information
        // builder
        //     .addCase(updateAgentPublishment.pending, (state) => {
        //         state.status = 'loading';
        //     })
        //     .addCase(updateAgentPublishment.fulfilled, (state, action) => {
        //         state.status = 'succeeded';
        //         if (state.agentPublishmentDetail)
        //             state.agentPublishmentDetail = { ...state.agentPublishmentDetail, ...action.payload };
        //         state.agentPublishments.items = state.agentPublishments.items.map(item =>
        //             item.id === action.payload.id ? {...item, ...action.payload} : item
        //         );
        //     })
        //     .addCase(updateAgentPublishment.rejected, (state, action) => {
        //         state.status = 'failed';
        //         state.error = action.payload as string;
        //     });

        // Delete publishs
        // builder
        //     .addCase(deleteAgentPublishment.pending, (state) => {
        //         state.status = 'loading';
        //     })
        //     .addCase(deleteAgentPublishment.fulfilled, (state, action) => {
        //         state.status = 'succeeded';
        //
        //         state.agentPublishments.items = state.agentPublishments.items.filter(
        //             (publish) => action.payload !== publish.id
        //         );
        //     })
        //     .addCase(deleteAgentPublishment.rejected, (state, action) => {
        //         state.status = 'failed';
        //         state.error = action.payload as string;
        //     });
    },
});

// Export actions
export const { resetAgentPublishmentInfo, setAgentPublishmentInfo, setAgentPublishmentStateInfo} = publishSlice.actions;

// Export reducer
export default publishSlice.reducer;
