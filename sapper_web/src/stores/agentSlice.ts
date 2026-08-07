import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAllAgents,
    fetchAgentList,
    fetchAgentDetail,
    createAgent,
    updateAgent,
    deleteAgent,
    generateSplForm,
    resetAgentPlugins,
    resetAgentKnowledgeBases,
    fetchPublicAgentList,
    favoriteAgent,
    ratingAgent,
} from '../service/agentService';

import {AgentDetail, AgentPagination, AgentRes, AgentState} from "../types/agentType";

const initialState: AgentState = {
    agents: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    publicAgents: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    generating: false,
    agentDetail: null,
    processing: null,
    compileInfo: null,
    status: 'idle',
    error: null,
};

// Agent slice
const agentSlice = createSlice({
    name: 'agent',
    initialState,
    reducers: {
        // Reset agent information
        resetAgentInfo: (state) => {
            state.agents = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.publicAgents = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.generating = false;
            state.agentDetail = null;
            state.processing = null;
            state.compileInfo = null;
            state.status = 'idle';
            state.error = null;
        },
        // Set partial agent information
        setAgentInfo: (state, action: PayloadAction<Partial<AgentRes>>) => {
            if (state.agentDetail) {
                state.agentDetail = { ...state.agentDetail, ...action.payload };
            }
        },
        setAgentStateInfo: (state, action: PayloadAction<Partial<AgentState>>) => {
            Object.assign(state, action.payload);
        },
        generateSplFormMessage: (state, action) => {
            state.agentDetail?.spl_form?.push(action.payload)
            if(!state.processing)
                state.processing = 0
            state.processing += 20;
            if(state.processing === 100)
                state.processing = null
        },
    },
    extraReducers: (builder) => {
        // Fetch all agents
        builder
            .addCase(fetchAllAgents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllAgents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agents = action.payload;
            })
            .addCase(fetchAllAgents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch all public agents
        builder
            .addCase(fetchPublicAgentList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPublicAgentList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.publicAgents = action.payload;
            })
            .addCase(fetchPublicAgentList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch agent list (paginated)
        builder
            .addCase(fetchAgentList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAgentList.fulfilled, (state, action: PayloadAction<AgentPagination>) => {
                state.status = 'succeeded';
                state.agents = action.payload;
            })
            .addCase(fetchAgentList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch agent details
        builder
            .addCase(fetchAgentDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAgentDetail.fulfilled, (state, action: PayloadAction<AgentDetail>) => {
                state.status = 'succeeded';
                state.agentDetail = action.payload;
            })
            .addCase(fetchAgentDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Create a new agent
        builder
            .addCase(createAgent.fulfilled, (state, action) => {
                // state.status = 'succeeded';
                state.agents.items = [action.payload, ...state.agents.items]
                setAgentStateInfo({generating: true})
            })
            .addCase(createAgent.rejected, (state, action) => {
                // state.status = 'failed';
                state.error = action.payload as string;
            });

        // Update agent information
        builder
            // .addCase(updateAgent.fulfilled, (state) => {
            //     state.status = 'succeeded';
            // })
            .addCase(updateAgent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // favorite agent
        builder
            .addCase(favoriteAgent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                console.log('succeeded', state.agentDetail?.user_interaction.is_favorite, action.payload);
                if(state.agentDetail && state.agentDetail.user_interaction){
                    if(!state.agentDetail.user_interaction.is_favorite){
                        state.agentDetail.total_favorites += 1
                    }else
                        state.agentDetail.total_favorites -= 1

                    state.agentDetail.user_interaction.is_favorite = !state.agentDetail.user_interaction.is_favorite
                }
            })
            .addCase(favoriteAgent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // // rating agent
        builder
            .addCase(ratingAgent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if(state.agentDetail && state.agentDetail.user_interaction){
                    let rating_count = state.agentDetail.rating_count
                    let rating = state.agentDetail.total_rating * state.agentDetail.rating_count

                    if(state.agentDetail.user_interaction.rating_value > 0){
                        rating -= state.agentDetail.user_interaction.rating_value
                    }else {
                        rating_count += 1
                    }
                    rating += action.payload
                    if(rating_count >= 10){
                        state.agentDetail.total_rating = rating / rating_count
                        state.agentDetail.rating_count = rating_count
                    }
                    state.agentDetail.user_interaction.rating_value = action.payload
                }
            })
            .addCase(ratingAgent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Reset agent plugin
        builder
            .addCase(resetAgentPlugins.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(resetAgentPlugins.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if(state.agentDetail)
                    state.agentDetail.plugins = action.payload;
            })
            .addCase(resetAgentPlugins.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Reset agent knowledge base
        builder
            .addCase(resetAgentKnowledgeBases.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(resetAgentKnowledgeBases.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if(state.agentDetail)
                    state.agentDetail.knowledge_bases = action.payload;
            })
            .addCase(resetAgentKnowledgeBases.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Delete agents
        builder
            .addCase(deleteAgent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agents.items = state.agents.items.filter(
                    (agent) => action.payload !== agent.id
                );
                state.agentDetail= null
            })
            .addCase(deleteAgent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        builder
            .addCase(generateSplForm.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(generateSplForm.fulfilled, (state) => {
                state.status = 'succeeded';
                state.processing = null;
            })
            .addCase(generateSplForm.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
                state.processing = null;
            });
    },
});

// Export actions
export const { resetAgentInfo, setAgentInfo, generateSplFormMessage, setAgentStateInfo} = agentSlice.actions;

// Export reducer
export default agentSlice.reducer;
