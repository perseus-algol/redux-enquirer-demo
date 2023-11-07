import { createAsyncThunk, Action, configureStore, createAction, current, Reducer } from '@reduxjs/toolkit';
import redux from '@reduxjs/toolkit';
import { TuiState, createReducer } from './redux-tui/createReducer';
import { config } from './state';
import { Prompt } from './redux-tui/types/interactions';
import { traverse } from './mock-data/utils/traverse';
import { castDraft, createDraft } from 'immer';
import cloneDeep from 'lodash.clonedeep';
import { getInteraction, normalizeConfig } from './redux-tui/config-utils';
import { ConfigStrict } from './redux-tui/types/config';
import * as tui from './redux-tui/render';

type Tx = string;

type Store = TuiState & {
  oracleTx?: Tx;
}

// type QuestionsFilter = 'open' | 'completed' | 'all';

// const fetchQuestions = createAsyncThunk('qwd', async (arg: QuestionsFilter) => {
//   return Promise.resolve([
//     1,2,3
//   ]);
// });

const goToStart = (state: Store) => {
  state.stack = [];
  state.interaction = getInteraction([{ // ToDo: rewrite
    type: 'configItem',
    name: 'main',
    message: 'Start',
    action: normalizeConfig(config)
  }], ['main']);
}

const reducer = createReducer<Store>({
  stack: [],
}, config, {
  oracle: {
    create: goToStart
  }
}, [
  (state, action) => {
    if (action.type === 'back') {
      console.log('was here');
      state.stack.pop();
    }
  }
]);

const store = configureStore<Store>({
  reducer,
});

const isObject = (v: any) => typeof v === 'object' && !(v instanceof Array) && v !== null;

const render = async () => {
  const state = store.getState();
  console.log(state);
  tui.render({
    dispatch: store.dispatch,
    interaction: state.interaction,
  })
}

store.subscribe(render);

render();
