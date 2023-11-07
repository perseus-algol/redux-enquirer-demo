import { createAsyncThunk, Action, configureStore, createAction, current, Reducer } from '@reduxjs/toolkit';
import redux from '@reduxjs/toolkit';
import { TuiState, createReducer } from './redux-tui/createReducer';
import { config } from './state/graph';
import enquirer from 'enquirer';
import { Prompt } from './redux-tui/types/interactions';
import { traverse } from './mock-data/utils/traverse';
const { Select, Input } = (enquirer as any);
const { prompt } = enquirer;
import { castDraft, createDraft } from 'immer';
import cloneDeep from 'lodash.clonedeep';
import { getInteraction, normalizeConfig } from './redux-tui/config-utils';
import { ConfigStrict } from './redux-tui/types/config';

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

const goBack = (state: Store) => {
  state.stack = [];
  state.interaction = getInteraction([{ // ToDo: rewrite
    type: 'configItem',
    name: 'main',
    message: 'Start',
    action: normalizeConfig(config)
  }], ['main']);
}

// ToDo: rewrite
const reducer = createReducer<Store>({
  stack: [],
}, config, {
  oracle: {
    create: goBack
  }
});

const store = configureStore<Store>({
  reducer,
});

const isObject = (v: any) => typeof v === 'object' && !(v instanceof Array) && v !== null;

const render = async () => {
  
  const state = store.getState();
  console.log(state);
  if (state.interaction) {
    if (state.interaction.type === 'sequence') {
      const a: any = await prompt(cloneDeep(state.interaction.sequence) as any);
      const action = createAction<void>('sequence');
      store.dispatch(action());
    } else {
      const a: any = await prompt(cloneDeep(state.interaction) as any);
      const action = createAction<void>(a[state.interaction.name]);
      store.dispatch(action());
    }
  }
}

store.subscribe(render);

render();
