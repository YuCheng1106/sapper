import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAllTextBlocks,
    fetchTextBlockList,
    fetchTextBlockDetail,
    createTextBlock,
    updateTextBlock,
    deleteTextBlock,
} from '../service/textBlockService';

import {TextBlockDetail, TextBlockPagination, TextBlockRes, TextBlockState} from "../types/textBlockType";

const initialState: TextBlockState = {
    textBlocks: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    textBlockDetail: null,
    status: 'idle',
    error: null,
};

// TextBlock slice
const textBlockSlice = createSlice({
    name: 'textBlock',
    initialState,
    reducers: {
        // Reset textBlock information
        resetTextBlockInfo: (state) => {
            state.textBlocks = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.textBlockDetail = null;
            state.status = 'idle';
            state.error = null;
        },
        // Set partial textBlock information
        setTextBlockInfo: (state, action: PayloadAction<Partial<TextBlockRes>>) => {
            if (state.textBlockDetail) {
                state.textBlockDetail = { ...state.textBlockDetail, ...action.payload };
            }
        },
        setTextBlockStateInfo: (state, action: PayloadAction<Partial<TextBlockState>>) => {
            Object.assign(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        // Fetch all textBlocks
        builder
            .addCase(fetchAllTextBlocks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllTextBlocks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.textBlocks = action.payload;
            })
            .addCase(fetchAllTextBlocks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch textBlock list (paginated)
        builder
            .addCase(fetchTextBlockList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTextBlockList.fulfilled, (state, action: PayloadAction<TextBlockPagination>) => {
                state.status = 'succeeded';
                state.textBlocks = action.payload;
            })
            .addCase(fetchTextBlockList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch textBlock details
        builder
            .addCase(fetchTextBlockDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTextBlockDetail.fulfilled, (state, action: PayloadAction<TextBlockDetail>) => {
                state.status = 'succeeded';
                state.textBlockDetail = action.payload;
            })
            .addCase(fetchTextBlockDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Create a new textBlock
        builder
            .addCase(createTextBlock.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createTextBlock.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(createTextBlock.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Update textBlock information
        builder
            .addCase(updateTextBlock.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateTextBlock.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (state.textBlockDetail)
                    state.textBlockDetail = { ...state.textBlockDetail, ...action.payload };
                state.textBlocks.items = state.textBlocks.items.map(item =>
                    item.id === action.payload.id ? {...item, ...action.payload} : item
                );
            })
            .addCase(updateTextBlock.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Delete textBlocks
        builder
            .addCase(deleteTextBlock.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteTextBlock.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(deleteTextBlock.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const { resetTextBlockInfo, setTextBlockInfo, setTextBlockStateInfo} = textBlockSlice.actions;

// Export reducer
export default textBlockSlice.reducer;
