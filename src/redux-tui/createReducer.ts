import { Action } from "@reduxjs/toolkit";
import { traverse } from "../mock-data/utils/traverse";
import type { Draft } from 'immer'
import { isDraft, isDraftable, produce as createNextState } from 'immer'
import { Prompt } from "./config/types/prompts";
import { isPathInConfig } from "./config";
import { InteractionTree } from "./config/types/config-strict";

export interface TuiState {
  stack: string[];
  display?: any;
  prompt?: Prompt;
}

const isEqualPath = (p1: string[], p2: string[]) => {
  if (p1.length !== p2.length) {
    return false;
  }
  return p1.every((v, i) => v === p2[i]);
}

const flatten = <TState>(cases: ReducerMapObj<TState>) => {
  const result: Array<[path: string[], reducer: (s: TState, a: Action) => any]> = [];
  const isReducer = (value: unknown): value is (s: TState, a: Action) => any => typeof value === 'function';
  traverse(cases, (_, path, value) => {
    if (isReducer(value)) {
      result.push([path.map(String), value]);
    } 
  });
  return result;
}

type ReducerMapObj<TState> = { 
  [TAction in string]: ReducerMapObj<TState> | ((s: TState, a: Action) => any)
}

const caseReducersReducer = <TState extends TuiState>(action: Action) => (
  previousState: TState,
  caseReducer: (s: TState, a: Action) => any
): TState => {
  if (caseReducer) {
    if (isDraft(previousState)) {
      // If it's already a draft, we must already be inside a `createNextState` call,
      // likely because this is being wrapped in `createReducer`, `createSlice`, or nested
      // inside an existing draft. It's safe to just pass the draft to the mutator.
      const result = caseReducer(previousState, action);

      if (result === undefined) {
        return previousState
      }

      return result;
    } else if (!isDraftable(previousState)) {
      // If state is not draftable (ex: a primitive, such as 0), we want to directly
      // return the caseReducer func and not wrap it with produce.
      const result = caseReducer(previousState, action)

      if (result === undefined) {
        if (previousState === null) {
          return previousState
        }
        throw Error(
          'A case reducer on a non-draftable value must not return undefined'
        )
      }

      return result;
    } else {
      // @ts-ignore createNextState() produces an Immutable<Draft<S>> rather
      // than an Immutable<S>, and TypeScript cannot find out how to reconcile
      // these two types.
      return createNextState(previousState, (draft: Draft<TState>) => {
        // @ts-ignore
        return caseReducer(draft, action)
      })
    }
  }

  return previousState;
}

function isStateFunction<S>(x: unknown): x is () => S {
  return typeof x === 'function'
}

const getTuiInitialState = <S>(config: InteractionTree<S>): TuiState => {
  return {
    stack: [],
  }
}

const createTuiReducer = <S extends TuiState>(config: InteractionTree<S>) => {

  return (state: S, action: Action): S => {
    const path = [...state.stack, action.type];
    const isInConfig = isPathInConfig(config, path);
    // console.log(`path: ${path}; isInConfig: ${isInConfig}`);
    
    if (action.type === 'tui') {
      return {
        ...state,
        ...((action as any).payload as TuiState),
      }
    }
    
    if (!isInConfig && !state.display) {
      return state;
    }
    return {
      ...state,
      stack: isInConfig ? path : state.stack,
      display: undefined
    };
  }
}

export const createReducer = <S extends TuiState>(
  initialState: S | (() => S),
  config: InteractionTree<S>,
  cases: ReducerMapObj<S>,
  additional: Array<(s: S, a: Action) => any>
) => {
  const normConfig = config;
  const tuiInitial = getTuiInitialState(normConfig);

  let getInitialState: () => S;
  if (isStateFunction(initialState)) {
    getInitialState = () => ({ ...tuiInitial, ...initialState() });
  } else {
    const frozenInitialState = { ...tuiInitial, ...initialState }
    getInitialState = () => frozenInitialState;
  }

  const tuiReducer = createTuiReducer<S>(normConfig)

  return (state: S = getInitialState(), action: Action) => {
    // console.log('[DEBUG] action', action);
    const uptatedState = tuiReducer(state, action);
    const caseReducers = flatten(cases)
      .filter(([path, _]) => isEqualPath(path, [...uptatedState.stack, action.type]))
      .map(([_, r]) => r);

    return caseReducers.concat(additional).reduce(caseReducersReducer<S>(action), uptatedState);
  }
}
