import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAllPlugins,
    fetchPluginList,
    fetchPluginDetail,
    createPlugin,
    updatePlugin,
    deletePlugin, fetchPublicPluginList,
} from '../service/pluginService';

import {PluginDetail, PluginPagination, PluginRes, PluginState} from "../types/pluginType";

const initialState: PluginState = {
    plugins: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    publicPlugins: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        total_pages: 0,
        links: []
    },
    pluginDetail: null,
    status: 'idle',
    error: null,
};

// Plugin slice
const pluginSlice = createSlice({
    name: 'plugin',
    initialState,
    reducers: {
        // Reset plugin information
        resetPluginInfo: (state) => {
            state.plugins = {
                items: [],
                total: 0,
                page: 1,
                size: 10,
                total_pages: 0,
                links: []
            };
            state.pluginDetail = null;
            state.status = 'idle';
            state.error = null;
        },
        // Set partial plugin information
        setPluginInfo: (state, action: PayloadAction<Partial<PluginRes>>) => {
            if (state.pluginDetail) {
                state.pluginDetail = { ...state.pluginDetail, ...action.payload };
            }
        },
        setPluginStateInfo: (state, action: PayloadAction<Partial<PluginState>>) => {
            Object.assign(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        // Fetch all plugins
        builder
            .addCase(fetchAllPlugins.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllPlugins.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.plugins.items = action.payload;
            })
            .addCase(fetchAllPlugins.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch all public plugins
        builder
            .addCase(fetchPublicPluginList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPublicPluginList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.publicPlugins = action.payload;
            })
            .addCase(fetchPublicPluginList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch plugin list (paginated)
        builder
            .addCase(fetchPluginList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPluginList.fulfilled, (state, action: PayloadAction<PluginPagination>) => {
                state.status = 'succeeded';
                state.plugins = action.payload;
            })
            .addCase(fetchPluginList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Fetch plugin details
        builder
            .addCase(fetchPluginDetail.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPluginDetail.fulfilled, (state, action: PayloadAction<PluginDetail>) => {
                state.status = 'succeeded';
                state.pluginDetail = action.payload;
            })
            .addCase(fetchPluginDetail.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Create a new plugin
        builder
            .addCase(createPlugin.pending, (state) => {
                state.status = 'loading';
            })
            // .addCase(createPlugin.fulfilled, (state, action: PayloadAction<PluginRes>) => {
            //     state.status = 'succeeded';
            //     // state.plugins.items = [action.payload, ...state.plugins.items]
            // })
            .addCase(createPlugin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Update plugin information
        builder
            .addCase(updatePlugin.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updatePlugin.fulfilled, (state) => {
                state.status = 'succeeded';

            })
            .addCase(updatePlugin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Delete plugins
        builder
            .addCase(deletePlugin.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deletePlugin.fulfilled, (state, action) => {
                state.status = 'succeeded';

                state.plugins.items = state.plugins.items.filter(
                    (plugin) => action.payload !== plugin.id
                );
            })
            .addCase(deletePlugin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const { resetPluginInfo, setPluginInfo, setPluginStateInfo} = pluginSlice.actions;

// Export reducer
export default pluginSlice.reducer;
