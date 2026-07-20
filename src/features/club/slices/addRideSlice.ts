import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

export interface AddRideState {
  // Step 1 fields
  rideName: string;
  date: string;
  time: string;
  activityTypeId: number;
  sportSubTypeId: number;
  categoryTypeId: number;
  meetingPoint: string;
  gpxFile: string;
  distance: number;
  description: string;

  // Step 2 fields
  pace: string;
  elevationGain: number;
  isRecurringActivity: boolean;
  recurringActivities: string[]; // days checklist: e.g. ['Monday', 'Wednesday']
  expiryDate: string;
  stops: number[]; 
  isStops: boolean;
  recommendedSlots: string[];
  isRecommendedSlots: boolean;

  // Step 3 fields
  isPublic: boolean;
  isWomenAndNonBinary: boolean;
  isPaymentRequired: boolean;
  rideLeaders: { userId: number; name: string }[];
  supportCarDriver: { userId?: number; name: string } | null;

  // UI state
  currentStep: number;
}

const initialState: AddRideState = {
  rideName: '',
  date: '',
  time: '',
  activityTypeId: 1,
  sportSubTypeId: 1,
  categoryTypeId: 1,
  meetingPoint: '',
  gpxFile: '',
  distance: 0,
  description: '',
  pace: 'Medium',
  elevationGain: 0,
  isRecurringActivity: false,
  recurringActivities: [],
  expiryDate: '',
  stops: [],
  isStops: false,
  recommendedSlots: [],
  isRecommendedSlots: false,
  isPublic: true,
  isWomenAndNonBinary: false,
  isPaymentRequired: false,
  rideLeaders: [],
  supportCarDriver: null,
  currentStep: 1,
};

const addRideSlice = createSlice({
  name: 'addRide',
  initialState,
  reducers: {
    updateStepFields(state, action: PayloadAction<Partial<AddRideState>>) {
      return { ...state, ...action.payload };
    },
    setStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    resetRideForm() {
      return initialState;
    },
  },
});

export const { updateStepFields, setStep, resetRideForm } = addRideSlice.actions;
export default addRideSlice.reducer;
