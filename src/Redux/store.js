import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Debug: Monitor store state changes
store.subscribe(() => {
  const state = store.getState();
  console.log('🔄 Redux Store State Changed:', {
    user: state.user,
    timestamp: new Date().toISOString()
  });
});

// Debug: Monitor dispatched actions
const originalDispatch = store.dispatch;
store.dispatch = (action) => {
  console.log('🚀 Redux Action Dispatched:', action);
  console.log('🚀 Action Type:', action.type);
  console.log('🚀 Action Payload:', action.payload);
  
  const result = originalDispatch(action);
  
  console.log('✅ Redux Action Completed:', action.type);
  return result;
};

export default store;
