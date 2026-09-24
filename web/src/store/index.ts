import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Simple no-op reducer for the web store
// The web app uses JWT auth in localStorage, not Redux for auth state
const rootReducer = {
  // Placeholder reducer - web app doesn't heavily use Redux state
  // This prevents the "Store does not have a valid reducer" error
  _: (state: any = {}, action: any) => state,
};

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
