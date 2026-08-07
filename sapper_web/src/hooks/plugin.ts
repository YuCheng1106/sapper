import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
    fetchAllPlugins,
    fetchPluginList,
    fetchPluginDetail,
    createPlugin,
    updatePlugin,
    deletePlugin, fetchPublicPluginList
} from '../service/pluginService';
import { RootState, AppDispatch } from '../stores';
import {resetPluginInfo, setPluginInfo, setPluginStateInfo} from '../stores/pluginSlice';
import {PluginCreateReq, PluginDetail, PluginState, PluginUpdateReq, GetPluginListParam} from "../types/pluginType";


export function useDispatchPlugin() {
    const dispatch = useDispatch<AppDispatch>();

    // Get all Plugins
    const getAllPlugins = useCallback(() => {
        return dispatch(fetchAllPlugins());
    }, [dispatch]);

    // Get all Plugins
    const getAllPublicPlugins = useCallback((params?: GetPluginListParam)=> {
        return dispatch(fetchPublicPluginList(params));
    }, [dispatch]);

    // Get Plugin list (pagination)
    const getPluginList = useCallback((params?: GetPluginListParam) => {
        return dispatch(fetchPluginList(params));
    }, [dispatch]);

    // Get Plugin details
    const getPluginDetail = useCallback((pluginUuid: string) => {
        return dispatch(fetchPluginDetail(pluginUuid));
    }, [dispatch]);

    // Create a new Plugin
    const addPlugin = useCallback((pluginData: PluginCreateReq) => {
        return dispatch(createPlugin(pluginData));
    }, [dispatch]);

    // Update Plugin information
    const updatePluginInfo = useCallback((pluginUuid: string, data: PluginUpdateReq) => {
        return dispatch(updatePlugin({ pluginUuid, data }));
    }, [dispatch]);

    // Delete Plugins
    const removePlugin = useCallback((pk: number) => {
        return dispatch(deletePlugin(pk));
    }, [dispatch]);

    // Set partial Plugin info (partial update)
    const setPluginPartialInfo = useCallback((pluginInfo: Partial<PluginDetail>) => {
        dispatch(setPluginInfo(pluginInfo));
    }, [dispatch]);

    // Reset Plugin info
    const resetPlugin = useCallback(() => {
        dispatch(resetPluginInfo());
    }, [dispatch]);

    // Reset Compile info
    const setPluginStatePartialInfo = useCallback((pluginStateInfo: Partial<PluginState>) => {
        dispatch(setPluginStateInfo(pluginStateInfo));
    }, [dispatch]);

    return {
        getAllPlugins,
        getPluginList,
        getPluginDetail,
        addPlugin,
        updatePluginInfo,
        removePlugin,
        setPluginPartialInfo,
        resetPlugin,
        setPluginStatePartialInfo,
        getAllPublicPlugins
    };
}

// Create a typed useSelector hook
export const usePluginSelector: TypedUseSelectorHook<RootState> = useSelector;
