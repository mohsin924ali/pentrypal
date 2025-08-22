/**
 * UI Slice
 * Manages global UI state and preferences
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  loading: boolean;
  loadingMessage?: string;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  };
  modal: {
    visible: boolean;
    type?: string;
    data?: any;
  };
  bottomSheet: {
    visible: boolean;
    type?: string;
    data?: any;
  };
  keyboard: {
    visible: boolean;
    height: number;
  };
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  orientation: 'portrait' | 'landscape';
  networkStatus: 'online' | 'offline' | 'unknown';
}

// Initial state
const initialState: UIState = {
  theme: 'system',
  loading: false,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
  modal: {
    visible: false,
  },
  bottomSheet: {
    visible: false,
  },
  keyboard: {
    visible: false,
    height: 0,
  },
  safeArea: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  orientation: 'portrait',
  networkStatus: 'unknown',
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme management
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },

    // Loading state
    setLoading: (
      state,
      action: PayloadAction<boolean | { loading: boolean; message?: string }>,
    ) => {
      if (typeof action.payload === 'boolean') {
        state.loading = action.payload;
        if (!action.payload) {
          state.loadingMessage = undefined;
        }
      } else {
        state.loading = action.payload.loading;
        state.loadingMessage = action.payload.message;
      }
    },

    // Toast management
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        type?: 'success' | 'error' | 'warning' | 'info';
        duration?: number;
      }>,
    ) => {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration,
      };
    },

    hideToast: state => {
      state.toast.visible = false;
    },

    // Modal management
    showModal: (
      state,
      action: PayloadAction<{
        type?: string;
        data?: any;
      }>,
    ) => {
      state.modal = {
        visible: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },

    hideModal: state => {
      state.modal = {
        visible: false,
        type: undefined,
        data: undefined,
      };
    },

    // Bottom sheet management
    showBottomSheet: (
      state,
      action: PayloadAction<{
        type?: string;
        data?: any;
      }>,
    ) => {
      state.bottomSheet = {
        visible: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },

    hideBottomSheet: state => {
      state.bottomSheet = {
        visible: false,
        type: undefined,
        data: undefined,
      };
    },

    // Keyboard state
    setKeyboardState: (
      state,
      action: PayloadAction<{
        visible: boolean;
        height: number;
      }>,
    ) => {
      state.keyboard = action.payload;
    },

    // Safe area insets
    setSafeArea: (
      state,
      action: PayloadAction<{
        top: number;
        bottom: number;
        left: number;
        right: number;
      }>,
    ) => {
      state.safeArea = action.payload;
    },

    // Orientation
    setOrientation: (
      state,
      action: PayloadAction<'portrait' | 'landscape'>,
    ) => {
      state.orientation = action.payload;
    },

    // Network status
    setNetworkStatus: (
      state,
      action: PayloadAction<'online' | 'offline' | 'unknown'>,
    ) => {
      state.networkStatus = action.payload;
    },

    // Reset UI state
    resetUI: () => initialState,
  },
});

// Export actions
export const {
  setTheme,
  setLoading,
  showToast,
  hideToast,
  showModal,
  hideModal,
  showBottomSheet,
  hideBottomSheet,
  setKeyboardState,
  setSafeArea,
  setOrientation,
  setNetworkStatus,
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectLoadingMessage = (state: { ui: UIState }) =>
  state.ui.loadingMessage;
export const selectToast = (state: { ui: UIState }) => state.ui.toast;
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectBottomSheet = (state: { ui: UIState }) =>
  state.ui.bottomSheet;
export const selectKeyboard = (state: { ui: UIState }) => state.ui.keyboard;
export const selectSafeArea = (state: { ui: UIState }) => state.ui.safeArea;
export const selectOrientation = (state: { ui: UIState }) =>
  state.ui.orientation;
export const selectNetworkStatus = (state: { ui: UIState }) =>
  state.ui.networkStatus;

// Export reducer
export default uiSlice.reducer;
