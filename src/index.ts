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
import * as tui from './redux-tui/handleInteraction';

type Tx = string;

type State = TuiState & {
  oracleTx?: Tx;
}

const goToStart = (state: State): void => {
  state.stack = [];
};

const goBack = (state: State, action: Action): void => {
  if (action.type === 'back') {
    state.stack.pop();
  }
}

const reducer = createReducer<State>({
  stack: [],
}, config, {
  oracle: {
    create: goToStart,
  }
}, [
  goBack,
]);

const store = configureStore<State>({
  reducer,
});

const render = async () => {
  const state = store.getState();
  console.log(state);

  const interactionFromConfig = getInteraction(config, state.stack);

  const prompt = state.prompt
    ? state.prompt 
    : interactionFromConfig !== undefined
      ? interactionFromConfig.prompt 
      : undefined;

  if (prompt) {
    const answer = await tui.handleInteraction(prompt);
    const payload = prompt.type === 'sequence'
      ? answer
      : answer[prompt.name];
    const actionCreator = interactionFromConfig?.action
      ? createAsyncThunk(prompt.name, interactionFromConfig.action)
      : createAction<any>(
        prompt.type === 'sequence' 
          ? prompt.type
          : answer[prompt.name]
      );
    const action = actionCreator(payload);
    store.dispatch(action);
  }
}

store.subscribe(render);

render();
