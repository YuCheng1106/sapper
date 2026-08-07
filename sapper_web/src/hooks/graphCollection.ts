import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
    fetchAllGraphCollections,
    fetchGraphCollectionList,
    fetchGraphCollectionDetail,
    createGraphCollection,
    updateGraphCollection,
    deleteGraphCollection
} from '../service/graphCollectionService';
import { RootState, AppDispatch } from '../stores';
import {resetGraphCollectionInfo, setGraphCollectionInfo, setGraphCollectionStateInfo} from '../stores/graphCollectionSlice';
import {GraphCollectionCreateReq, GraphCollectionDetail, GraphCollectionState, GraphCollectionUpdateReq, GetGraphCollectionListParam} from "../types/graphCollectionType";


export function useDispatchGraphCollection() {
    const dispatch = useDispatch<AppDispatch>();

    // Get all GraphCollections
    const getAllGraphCollections = useCallback(() => {
        return dispatch(fetchAllGraphCollections());
    }, [dispatch]);

    // Get GraphCollection list (pagination)
    const getGraphCollectionList = useCallback((params?: GetGraphCollectionListParam) => {
        return dispatch(fetchGraphCollectionList(params));
    }, [dispatch]);

    // Get GraphCollection details
    const getGraphCollectionDetail = useCallback((graphCollectionUuid: string) => {
        return dispatch(fetchGraphCollectionDetail(graphCollectionUuid));
    }, [dispatch]);

    // Create a new GraphCollection
    const addGraphCollection = useCallback((graphCollectionData: GraphCollectionCreateReq) => {
        return dispatch(createGraphCollection(graphCollectionData));
    }, [dispatch]);

    // Update GraphCollection information
    const updateGraphCollectionInfo = useCallback((graphCollectionId: number, data: GraphCollectionUpdateReq) => {
        return dispatch(updateGraphCollection({ graphCollectionId, data }));
    }, [dispatch]);

    // Delete GraphCollections
    const removeGraphCollection = useCallback((pk: number) => {
        return dispatch(deleteGraphCollection(pk));
    }, [dispatch]);

    // Set partial GraphCollection info (partial update)
    const setGraphCollectionPartialInfo = useCallback((graphCollectionInfo: Partial<GraphCollectionDetail>) => {
        dispatch(setGraphCollectionInfo(graphCollectionInfo));
    }, [dispatch]);

    // Reset GraphCollection info
    const resetGraphCollection = useCallback(() => {
        dispatch(resetGraphCollectionInfo());
    }, [dispatch]);

    // Reset Compile info
    const setGraphCollectionStatePartialInfo = useCallback((graphCollectionStateInfo: Partial<GraphCollectionState>) => {
        dispatch(setGraphCollectionStateInfo(graphCollectionStateInfo));
    }, [dispatch]);

    return {
        getAllGraphCollections,
        getGraphCollectionList,
        getGraphCollectionDetail,
        addGraphCollection,
        updateGraphCollectionInfo,
        removeGraphCollection,
        setGraphCollectionPartialInfo,
        resetGraphCollection,
        setGraphCollectionStatePartialInfo
    };
}

// Create a typed useSelector hook
export const useGraphCollectionSelector: TypedUseSelectorHook<RootState> = useSelector;
