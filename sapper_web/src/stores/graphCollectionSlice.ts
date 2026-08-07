import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAllGraphCollections,
    fetchGraphCollectionList,
    fetchGraphCollectionDetail,
    createGraphCollection,
    updateGraphCollection,
    deleteGraphCollection,
} from '../service/graphCollectionService';

import {GraphCollectionDetail, GraphCollectionPagination, GraphCollectionRes, GraphCollectionState} from "../types/graphCollectionType";

const initialState: GraphCollectionState = {
    graphCollections: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    graphCollectionDetail: null,
    status: 'idle',
    error: null,
};

// GraphCollection slice
const graphGraphCollectionSlice = createSlice({
    name: 'graphCollection',
    initialState,
    reducers: {
        // Reset graphCollection information
        resetGraphCollectionInfo: (state) => {
            state.graphCollections = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.graphCollectionDetail = null;
            state.status = 'idle';
            state.error = null;
        },
        // Set partial graphCollection information
        setGraphCollectionInfo: (state, action: PayloadAction<Partial<GraphCollectionRes>>) => {
            if (state.graphCollectionDetail) {
                state.graphCollectionDetail = { ...state.graphCollectionDetail, ...action.payload };
            }
        },
        setGraphCollectionStateInfo: (state, action: PayloadAction<Partial<GraphCollectionState>>) => {
            Object.assign(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        // Fetch all graphCollections
        builder
            .addCase(fetchAllGraphCollections.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllGraphCollections.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.graphCollections = action.payload;
            })
            .addCase(fetchAllGraphCollections.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch graphCollection list (paginated)
        builder
            .addCase(fetchGraphCollectionList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGraphCollectionList.fulfilled, (state, action: PayloadAction<GraphCollectionPagination>) => {
                state.status = 'succeeded';
                state.graphCollections = action.payload;
            })
            .addCase(fetchGraphCollectionList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch graphCollection details
        builder
            .addCase(fetchGraphCollectionDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGraphCollectionDetail.fulfilled, (state, action: PayloadAction<GraphCollectionDetail>) => {
                state.status = 'succeeded';
                state.graphCollectionDetail = action.payload;
            })
            .addCase(fetchGraphCollectionDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Create a new graphCollection
        builder
            .addCase(createGraphCollection.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createGraphCollection.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.graphCollections.items = [action.payload, ...state.graphCollections.items]
            })
            .addCase(createGraphCollection.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Update graphCollection information
        builder
            .addCase(updateGraphCollection.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateGraphCollection.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (state.graphCollectionDetail)
                    state.graphCollectionDetail = { ...state.graphCollectionDetail, ...action.payload };
                state.graphCollections.items = state.graphCollections.items.map(item =>
                    item.id === action.payload.id ? {...item, ...action.payload} : item
                );
            })
            .addCase(updateGraphCollection.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Delete graphCollections
        builder
            .addCase(deleteGraphCollection.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteGraphCollection.fulfilled, (state, action) => {
                state.status = 'succeeded';

                state.graphCollections.items = state.graphCollections.items.filter(
                    (graphCollection) => action.payload !== graphCollection.id
                );
            })
            .addCase(deleteGraphCollection.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const { resetGraphCollectionInfo, setGraphCollectionInfo, setGraphCollectionStateInfo} = graphGraphCollectionSlice.actions;

// Export reducer
export default graphGraphCollectionSlice.reducer;
