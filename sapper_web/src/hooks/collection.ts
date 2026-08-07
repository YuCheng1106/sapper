import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
    fetchAllCollections,
    fetchCollectionList,
    fetchCollectionDetail,
    createCollection,
    updateCollection,
    deleteCollection
} from '../service/collectionService';
import { RootState, AppDispatch } from '../stores';
import {resetCollectionInfo, setCollectionInfo, setCollectionStateInfo} from '../stores/collectionSlice';
import {CollectionCreateReq, CollectionDetail, CollectionState, CollectionUpdateReq, GetCollectionListParam} from "../types/collectionType";


export function useDispatchCollection() {
    const dispatch = useDispatch<AppDispatch>();

    // Get all Collections
    const getAllCollections = useCallback(() => {
        return dispatch(fetchAllCollections());
    }, [dispatch]);

    // Get Collection list (pagination)
    const getCollectionList = useCallback((params?: GetCollectionListParam) => {
        return dispatch(fetchCollectionList(params));
    }, [dispatch]);

    // Get Collection details
    const getCollectionDetail = useCallback((collectionId: number) => {
        return dispatch(fetchCollectionDetail(collectionId));
    }, [dispatch]);

    // Create a new Collection
    const addCollection = useCallback((collectionData: CollectionCreateReq) => {
        return dispatch(createCollection(collectionData));
    }, [dispatch]);

    // Update Collection information
    const updateCollectionInfo = useCallback((collectionId: number, data: CollectionUpdateReq) => {
        return dispatch(updateCollection({ collectionId, data }));
    }, [dispatch]);

    // Delete Collections
    const removeCollection = useCallback((pk: number) => {
        return dispatch(deleteCollection(pk));
    }, [dispatch]);

    // Set partial Collection info (partial update)
    const setCollectionPartialInfo = useCallback((collectionInfo: Partial<CollectionDetail>) => {
        dispatch(setCollectionInfo(collectionInfo));
    }, [dispatch]);

    // Reset Collection info
    const resetCollection = useCallback(() => {
        dispatch(resetCollectionInfo());
    }, [dispatch]);

    // Reset Compile info
    const setCollectionStatePartialInfo = useCallback((collectionStateInfo: Partial<CollectionState>) => {
        dispatch(setCollectionStateInfo(collectionStateInfo));
    }, [dispatch]);

    return {
        getAllCollections,
        getCollectionList,
        getCollectionDetail,
        addCollection,
        updateCollectionInfo,
        removeCollection,
        setCollectionPartialInfo,
        resetCollection,
        setCollectionStatePartialInfo
    };
}

// Create a typed useSelector hook
export const useCollectionSelector: TypedUseSelectorHook<RootState> = useSelector;
