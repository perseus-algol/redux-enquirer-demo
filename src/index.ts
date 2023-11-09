import { Action, configureStore, PayloadAction } from '@reduxjs/toolkit';
import { createReducer } from './redux-tui/createReducer';
import { AppState, config } from './state';
import { View } from './redux-tui/view/View';


/////////////////////////////////////////////////////////////////////////////////////////
// Reducers

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

const reducer = createReducer<AppState>({
  stack: [],
}, config, {
  oracle: {
    'create/fulfilled': (s, action) => {
      const a = action as PayloadAction<{tx: string}>; // ToDo: improve type inference in createReducer
      s.oracleTx = a.payload.tx;
    },
  }
}, [
  goBack,
  exit,

]);


/////////////////////////////////////////////////////////////////////////////////////////
// Store Configuration

const store = configureStore<AppState>({
  reducer,
});

const view = new View(config, store);

store.subscribe(view.render);

view.render();
