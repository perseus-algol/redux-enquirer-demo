import { Action, Reducer } from "@reduxjs/toolkit";
import { Config, ConfigItemStrict, ConfigStrict } from "./types/config";
import { traverse } from "../mock-data/utils/traverse";
import type { Draft } from 'immer'
import { isDraft, isDraftable, produce as createNextState } from 'immer'
import { Prompt, Select } from "./types/interactions";
import { isPrompt, normalizeConfig } from "./config-utils";

export interface TuiState {
  stack: any[];
  interaction?: Prompt;
}

function freezeDraftable<T>(val: T) {
  // @ts-ignore
  return isDraftable(val) ? createNextState(val, () => {}) : val
}

const isEqualPath = (p1: string[], p2: string[]) => {
  if (p1.length !== p2.length) {
    return false;
  }
  return p1.every((v, i) => p1[i] === v);
}

const flatten = <TState>(cases: ReducerMapObj<TState>) => {
  const result: Array<[path: string[], reducer: Reducer<TState>]> = [];
  const isReducer = (value: unknown): value is Reducer<TState> => typeof value === 'function';
  traverse(cases, (_, path, value) => {
    if (isReducer(value)) {
      result.push([path.map(String), value]);
    } 
  });
  return result;
}

type ReducerMapObj<TState> = { 
  [TAction in string]: ReducerMapObj<TState> | Reducer<TState>
}

const caseReducersReducer = <TState extends TuiState>(action: Action) => (
  previousState: TState,
  caseReducer: Reducer<TState>
): TState => {
  if (caseReducer) {
    // if (isDraft(previousState)) {
    //   // If it's already a draft, we must already be inside a `createNextState` call,
    //   // likely because this is being wrapped in `createReducer`, `createSlice`, or nested
    //   // inside an existing draft. It's safe to just pass the draft to the mutator.
    //   const result = caseReducer(previousState, action);

    //   if (result === undefined) {
    //     return previousState
    //   }

    //   return result;
    // } else if (!isDraftable(previousState)) {
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
    // } else {
    //   // @ts-ignore createNextState() produces an Immutable<Draft<S>> rather
    //   // than an Immutable<S>, and TypeScript cannot find out how to reconcile
    //   // these two types.
    //   return createNextState(previousState, (draft: Draft<TState>) => {
    //     // @ts-ignore
    //     return caseReducer(draft, action)
    //   })
    // }
  }

  return previousState;
}

function isStateFunction<S>(x: unknown): x is () => S {
  return typeof x === 'function'
}

const getValueByPath_ = (config: ConfigStrict, path: string[]) => path.reduce((acc: Prompt | ConfigStrict | undefined, i) => {
  if (acc === undefined || isPrompt(acc)) {
    throw new Error("");
  }
  const r = acc.find(j => j.name === i)?.action;
  return r;
}, config)

const getInteractionCfgByPath = (config: ConfigStrict, path: string[]): ConfigItemStrict | undefined => {
  let list: ConfigStrict = config;
  let node: ConfigItemStrict | undefined;
  for (let i=0; i < path.length; i++) {
    node = list.find(j => j.name === path[i])
    if (node === undefined) {
      return undefined;
    }
    if (!(node.action instanceof Array) && i < path.length-1) {
      return undefined;
    }
    list = node.action instanceof Array ? node.action : list;
  }
  return node;
}

const getInteraction = (cfg: ConfigItemStrict) => {
  if (cfg.action === undefined) {
    return undefined;
  } else if (cfg.action instanceof Array) {
    const select: Select = {
      type: 'select',
      name: cfg.name,
      message: cfg.message,
      choices: cfg.action.map(i => ({ name: i.name, message: i.message }))
    }
    return select;
  } else if (typeof cfg.action === 'object') {
    return cfg.action;
  } else {
    throw new Error("");
  }
}

const createTuiReducer = <S extends TuiState>(config: ConfigStrict) => {

  return (state: S, action: Action): S => {
    console.log('stack', state.stack, 'action', action);
    const path = [...state.stack, action.type];
    const nextInteractionCfg = getInteractionCfgByPath(config, path);
    if (nextInteractionCfg === undefined) {
      return state;
    }
    const nextInteraction = getInteraction(nextInteractionCfg);
    const stack = nextInteractionCfg === undefined ? [] : path;
    return {
      ...state,
      stack,
      interaction: nextInteraction
    }
  }
}

const getTuiInitialState = (normConfig: ConfigStrict): TuiState => {
  const initInteration = getInteraction({
    type: 'configItem',
    name: 'main',
    message: 'Start',
    action: normConfig
  });

  if (initInteration === undefined) {
    throw new Error("");
  }

  return {
    stack: [],
    interaction: initInteration
  }
}

export const createReducer = <S extends TuiState>(
  initialState: S | (() => S),
  config: Config,
  cases: ReducerMapObj<S>
) => {
  const normConfig = normalizeConfig(config);
  const tuiInitial = getTuiInitialState(normConfig);

  let getInitialState: () => S
  if (isStateFunction(initialState)) {
    getInitialState = () => ({ ...tuiInitial, ...initialState() })
  } else {
    const frozenInitialState = { ...tuiInitial, ...initialState }
    getInitialState = () => frozenInitialState
  }

  const tuiReducer = createTuiReducer<S>(normConfig)

  return (state: S = getInitialState(), action: Action) => {
    const caseReducers = flatten(cases)
      .filter(([path, _]) => isEqualPath(path, [...state.stack, action.type]))
      .map(([_, r]) => r);

    const uptatedState = tuiReducer(state, action);
    return caseReducers.reduce(caseReducersReducer<S>(action), uptatedState);
  }
}
