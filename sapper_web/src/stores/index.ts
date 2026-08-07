// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import agentSlice from "./agentSlice";
import conversationSlice from "./conversationSlice.ts";
import pluginSlice from "./pluginSlice";
import knowledgeBaseSlice from "./knowledgeBaseSlice";
import userSlice from "./userSlice";
import collectionSlice from "./collectionSlice";
import globalSlice from "./globalSlice";
import graphCollectionSlice from "./graphCollectionSlice.ts";
import textBlockSlice from "./textBlockSlice.ts";
import publishSlice from "./publishSlice.ts";
import llmProviderSlice from "./llmProviderSlice.ts";
import llmModelSlice from "./llmModelSlice.ts";

const rootReducer = combineReducers({
  user: userSlice,
  agent: agentSlice,
  conversation: conversationSlice,
  plugin: pluginSlice,
  knowledgeBase: knowledgeBaseSlice,
  collection: collectionSlice,
  graphCollection: graphCollectionSlice,
  global: globalSlice,
  textBlock: textBlockSlice,
  publish: publishSlice,
  llmProvider: llmProviderSlice,
  llmModel: llmModelSlice,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.NODE_ENV !== 'production',
});


export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
