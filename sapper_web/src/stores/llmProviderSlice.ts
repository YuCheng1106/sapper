import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchLLMProviderList as fetchProviderList,
    fetchLLMProviderDetail as fetchProviderDetail,
    createLLMProvider as createProvider,
    updateLLMProvider as updateProvider,
    deleteLLMProvider as deleteProvider,
    setLLMProviderStatus as setProviderStatus,
} from '../service/llmProviderService';
import { LLMProviderDetail, LLMProviderPagination, LLMProviderRes, LLMProviderState } from '../types/llmProviderType';

const initialState: LLMProviderState = {
    providers: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    providerDetail: null,
    status: 'idle',
    error: null,
};

const llmProviderSlice = createSlice({
    name: 'llmProvider',
    initialState,
    reducers: {
        // 重置提供商信息
        resetLLMProviderInfo: (state) => {
            state.providers = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.providerDetail = null;
            state.status = 'idle';
            state.error = null;
        },
        // 更新部分提供商信息
        setLLMProviderInfo: (state, action: PayloadAction<Partial<LLMProviderRes>>) => {
            if (state.providerDetail) {
                state.providerDetail = {
                    ...state.providerDetail,
                    ...action.payload
                };
            }
        },
        // 直接设置状态
        setLLMProviderStateInfo: (state, action: PayloadAction<Partial<LLMProviderState>>) => {
            Object.assign(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        // 分页获取提供商列表
        builder
            .addCase(fetchProviderList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProviderList.fulfilled, (state, action: PayloadAction<LLMProviderPagination>) => {
                state.status = 'succeeded';
                state.providers = action.payload;
            })
            .addCase(fetchProviderList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // 获取提供商详情
        builder
            .addCase(fetchProviderDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProviderDetail.fulfilled, (state, action: PayloadAction<LLMProviderDetail>) => {
                state.status = 'succeeded';
                state.providerDetail = action.payload;
            })
            .addCase(fetchProviderDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // 创建提供商
        builder
            .addCase(createProvider.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createProvider.fulfilled, (state, action: PayloadAction<LLMProviderRes>) => {
                state.status = 'succeeded';
                state.providers.items = [action.payload, ...state.providers.items];
            })
            .addCase(createProvider.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // 更新提供商
        builder
            .addCase(updateProvider.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateProvider.fulfilled, (state, action: PayloadAction<LLMProviderRes>) => {
                state.status = 'succeeded';
                const index = state.providers.items.findIndex(
                    p => p.id === action.payload.id
                );
                if (index !== -1) {
                    state.providers.items[index] = action.payload;
                }
            })
            .addCase(updateProvider.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // 删除提供商
        builder
            .addCase(deleteProvider.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteProvider.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // 设置提供商状态
        builder
            .addCase(setProviderStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(setProviderStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const provider = state.providers.items.find(
                    p => p.id === action.payload.pk
                );
                if (provider) {
                    provider.status = action.payload.status;
                }
            })
            .addCase(setProviderStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

// 导出 actions
export const {
    resetLLMProviderInfo,
    setLLMProviderInfo,
    setLLMProviderStateInfo
} = llmProviderSlice.actions;

export default llmProviderSlice.reducer;