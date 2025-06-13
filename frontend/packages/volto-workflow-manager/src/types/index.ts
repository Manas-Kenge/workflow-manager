// types/index.ts
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import type { WorkflowReduxState } from '../reducers/workflow'; // Adjust path as needed
// Adjust path as needed

// Define your root state interface
export interface RootState {
  workflow: WorkflowReduxState;
  // Add other slices of your state here as you have them
  // For example:
  // auth: AuthState;
  // ui: UIState;
}

// If you're using Redux Toolkit, you might define it like this instead:
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// For now, assuming you have a basic dispatch type
export type AppDispatch = any; // Replace with your actual dispatch type

// Create typed versions of useSelector and useDispatch hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
