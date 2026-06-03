import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // { [providerId]: { key: string, isValid: boolean, lastTested: null } }
  keys: {},
  isSettingsOpen: false,
};

const apiKeysSlice = createSlice({
  name: 'apiKeys',
  initialState,
  reducers: {
    setApiKey(state, action) {
      const { providerId, key } = action.payload;
      state.keys[providerId] = {
        key,
        isValid: false,
        lastTested: null,
      };
    },
    removeApiKey(state, action) {
      delete state.keys[action.payload];
    },
    markKeyValid(state, action) {
      const { providerId, isValid } = action.payload;
      if (state.keys[providerId]) {
        state.keys[providerId].isValid = isValid;
        state.keys[providerId].lastTested = Date.now();
      }
    },
    toggleSettings(state) {
      state.isSettingsOpen = !state.isSettingsOpen;
    },
    openSettings(state) {
      state.isSettingsOpen = true;
    },
    closeSettings(state) {
      state.isSettingsOpen = false;
    },
  },
});

export const {
  setApiKey, removeApiKey, markKeyValid,
  toggleSettings, openSettings, closeSettings,
} = apiKeysSlice.actions;

// ─── Selectors ───
export const selectApiKeys = (state) => state.apiKeys.keys;
export const selectApiKey = (providerId) => (state) => state.apiKeys.keys[providerId];
export const selectIsSettingsOpen = (state) => state.apiKeys.isSettingsOpen;
export const selectHasApiKey = (providerId) => (state) => !!state.apiKeys.keys[providerId]?.key;

export default apiKeysSlice.reducer;
