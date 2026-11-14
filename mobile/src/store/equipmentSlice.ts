import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FilterTab } from '@/types/equipment';

// UI state only. Equipment data lives in the RTK Query cache (see services/api/equipment.ts).
interface EquipmentUiState {
  activeFilter: FilterTab;
}

const initialState: EquipmentUiState = { activeFilter: 'all' };

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<FilterTab>) {
      state.activeFilter = action.payload;
    },
  },
});

export const { setFilter } = equipmentSlice.actions;

export const selectActiveFilter = (state: { equipment: EquipmentUiState }) =>
  state.equipment.activeFilter;

export default equipmentSlice.reducer;