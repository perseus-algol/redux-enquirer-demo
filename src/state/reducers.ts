import { Action, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "./state";
import { createReducer } from "../redux-tui/createReducer";
import { config } from "./actions";

const goToStart = (state: AppState): void => {
  state.stack = [];
};

const goBack = (state: AppState, action: Action): void => {
  if (action.type === 'back') {
    state.stack.pop();
  }
}

const exit = (state: AppState, action: Action): void => {
  if (action.type === 'exit') {
    process.exit(0);
  }
}


/////////////////////////////////////////////////////////////////////////////////////////
// Root Reducer

export const reducer = createReducer<AppState>({
  stack: [],
}, config, {
  oracle: {
    'create/fulfilled': (s, action) => {
      const a = action as PayloadAction<{tx: string}>; // ToDo: improve type inference in createReducer
      s.oracleTx = a.payload.tx;
      s.stack = [];
      s.display = a.payload;
    },
  }
}, [
  goBack,
  exit,
]);