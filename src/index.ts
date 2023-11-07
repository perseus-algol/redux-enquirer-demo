import { createAsyncThunk, Action, configureStore, createAction, current, Reducer } from '@reduxjs/toolkit';
import redux from '@reduxjs/toolkit';
import { TuiState, createReducer } from './redux-tui/createReducer';
import { config } from './state';
import { Prompt } from './redux-tui/types/interactions';
import { traverse } from './mock-data/utils/traverse';
import { castDraft, createDraft } from 'immer';
import cloneDeep from 'lodash.clonedeep';
import { getInteraction } from './redux-tui/config-utils';
import { Config } from './redux-tui/types/config';
import * as tui from './redux-tui/render';

type Tx = string;

type Store = TuiState & {
  oracleTx?: Tx;
}

const goToStart = (state: Store): void => {
  state.stack = [];
};

const goBack = (state: Store, action: Action) => {
  if (action.type === 'back') {
    console.log('was here');
    state.stack.pop();
  }
}

const reducer = createReducer<Store>({
  stack: [],
}, config, {
  oracle: {
    create: goToStart
  }
}, [
  goBack,
]);

const store = configureStore<Store>({
  reducer,
});

const render = async () => {
  const state = store.getState();
  console.log(state);

  tui.render({
    dispatch: store.dispatch,
    interaction: state.interaction 
      ? state.interaction 
      : getInteraction(config, state.stack),
  })
}

store.subscribe(render);

render();
