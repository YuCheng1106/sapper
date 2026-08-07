import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAllCollections,
    fetchCollectionList,
    fetchCollectionDetail,
    createCollection,
    updateCollection,
    deleteCollection,
} from '../service/collectionService';

import {CollectionDetail, CollectionPagination, CollectionRes, CollectionState} from "../types/collectionType";

const initialState: CollectionState = {
    collections: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    collectionDetail: null,
    status: 'idle',
    error: null,
};

// Collection slice
const collectionSlice = createSlice({
    name: 'collection',
    initialState,
    reducers: {
        // Reset collection information
        resetCollectionInfo: (state) => {
            state.collections = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.collectionDetail = null;
            state.status = 'idle';
            state.error = null;
        },
        // Set partial collection information
        setCollectionInfo: (state, action: PayloadAction<Partial<CollectionRes>>) => {
            if (state.collectionDetail) {
                state.collectionDetail = { ...state.collectionDetail, ...action.payload };
            }
        },
        setCollectionStateInfo: (state, action: PayloadAction<Partial<CollectionState>>) => {
            Object.assign(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        // Fetch all collections
        builder
            .addCase(fetchAllCollections.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllCollections.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.collections = action.payload;
            })
            .addCase(fetchAllCollections.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch collection list (paginated)
        builder
            .addCase(fetchCollectionList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCollectionList.fulfilled, (state, action: PayloadAction<CollectionPagination>) => {
                state.status = 'succeeded';
                state.collections = action.payload;
            })
            .addCase(fetchCollectionList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch collection details
        builder
            .addCase(fetchCollectionDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCollectionDetail.fulfilled, (state, action: PayloadAction<CollectionDetail>) => {
                state.status = 'succeeded';
                state.collectionDetail = action.payload;
            })
            .addCase(fetchCollectionDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Create a new collection
        builder
            .addCase(createCollection.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCollection.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.collections.items = [action.payload, ...state.collections.items]
            })
            .addCase(createCollection.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Update collection information
        builder
            .addCase(updateCollection.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCollection.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (state.collectionDetail)
                    state.collectionDetail = { ...state.collectionDetail, ...action.payload };
                state.collections.items = state.collections.items.map(item =>
                    item.id === action.payload.id ? {...item, ...action.payload} : item
                );
            })
            .addCase(updateCollection.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Delete collections
        builder
            .addCase(deleteCollection.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteCollection.fulfilled, (state, action) => {
                state.status = 'succeeded';

                state.collections.items = state.collections.items.filter(
                    (collection) => action.payload !== collection.id
                );
            })
            .addCase(deleteCollection.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const { resetCollectionInfo, setCollectionInfo, setCollectionStateInfo} = collectionSlice.actions;

// Export reducer
export default collectionSlice.reducer;
