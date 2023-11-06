import { createAsyncThunk, Action, configureStore, createAction, current } from '@reduxjs/toolkit';
import { TuiState, createReducer } from './redux-tui/createReducer';
import { config } from './state/graph';
import enquirer from 'enquirer';
import { Prompt } from './redux-tui/types/interactions';
import { traverse } from './mock-data/utils/traverse';
const { Select, Input } = (enquirer as any);
const { prompt } = enquirer;
import { castDraft, createDraft } from 'immer';
import cloneDeep from 'lodash.clonedeep';

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

const reducer = createReducer<Store>({
  stack: [],
}, config, {
});

const store = configureStore<Store>({
  reducer,
});

const isObject = (v: any) => typeof v === 'object' && !(v instanceof Array) && v !== null;

const formatConfigForEnquirer = (p: any): any => {
  // ToDo: rewrite.
  const traverse = (value: any) => {
    if (isObject(value)) {
      for (const key of Object.keys(value)) {
        if (value[key] === undefined) {
          delete value[key];
        } else {
          traverse(value[key]);
        }
      }
    } else if (value instanceof Array) {
      value.forEach(traverse)
    }
  }
  traverse(p);
  return p;
}

const render = async () => {
  
  const state = store.getState();
  console.log(state);
  if (state.interaction) {
    if (state.interaction.type === 'sequence') {
      console.log('sequence!')
    } else {
      const a: any = await prompt(cloneDeep(state.interaction) as any);
      const action = createAction<void>(a[state.interaction.name]);
      store.dispatch(action());
    }
  }
}

store.subscribe(render);

render();
