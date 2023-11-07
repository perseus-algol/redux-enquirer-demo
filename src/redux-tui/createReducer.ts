import { Action, Reducer } from "@reduxjs/toolkit";
import { ConfigParams, ConfigItem, Config } from "./types/config";
import { traverse } from "../mock-data/utils/traverse";
import type { Draft } from 'immer'
import { isDraft, isDraftable, produce as createNextState } from 'immer'
import { Prompt, Select } from "./types/interactions";
import { isPathInConfig } from "./config-utils";

export interface TuiState {
  stack: string[];
  prompt?: Prompt;
}

function freezeDraftable<T>(val: T) {
  // @ts-ignore
  return isDraftable(val) ? createNextState(val, () => {}) : val
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

const getTuiInitialState = (config: Config): TuiState => {
  return {
    stack: [],
  }
}

const createTuiReducer = <S extends TuiState>(config: Config) => {

  return (state: S, action: Action): S => {
    const path = [...state.stack, action.type];
    const isInConfig = isPathInConfig(config, path);
    // console.log(`path: ${path}; isInConfig: ${isInConfig}`);
    return isInConfig ? {
      ...state,
      stack: path,
    } : state;
  }
}

export const createReducer = <S extends TuiState>(
  initialState: S | (() => S),
  config: Config,
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
    const uptatedState = tuiReducer(state, action);
    const caseReducers = flatten(cases)
      .filter(([path, _]) => isEqualPath(path, [...uptatedState.stack, action.type]))
      .map(([_, r]) => r);

    return caseReducers.concat(additional).reduce(caseReducersReducer<S>(action), uptatedState);
  }
}
