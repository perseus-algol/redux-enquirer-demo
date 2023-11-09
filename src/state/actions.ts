import { normalizeConfig } from "../redux-tui/config";
import { Form, Prompt, Select } from "../redux-tui/config/types/prompts";
import { input, seq } from "../redux-tui/config/prompt-creators";
import * as lib from '../lib';
import { Action, ThunkDispatch, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { ThunkCreator } from "../redux-tui/config/types/config-common";
import { TreeConfig } from "../redux-tui/config/types/config-flexible";
import { AppState } from "./state";
import { TuiState } from "../redux-tui/createReducer";

type QuestionsFilter = 'open' | 'completed' | 'all';


/////////////////////////////////////////////////////////////////////////////////////////
// Actions

const tuiAction = (state: Partial<TuiState>) => {
  return createAction<Partial<TuiState>>('tui')(state);
}

const createRejected = <T>(typePrefix: string, payload: T) => {
  return createAction<T>(typePrefix + '/rejected')(payload);
}

const createFulfilled = <T>(typePrefix: string, payload: T) => {
  return createAction<T>(typePrefix + '/fulfilled')(payload);
}

const displayMsg = (msg: any) => tuiAction({display: msg, stack: []});

const createThunk = <T>(fn: (t: string, p: any) => Promise<T>): ThunkCreator<AppState> => {
  return t => p => async (dispatch, getState) => {
    try {
      const res = await fn(t, p);
      dispatch(displayMsg(res));
    } catch (err: any) {
      dispatch(displayMsg(err.message || `${t} error`));
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////
// Prompts

const questionForm: Form = {
  type: 'form',
  name: 'question',
  choices: [
    { name: 'question' },
    { name: 'description' },
    { name: 'categories' },
    { name: 'imageUrl' },
    { name: 'dueDate' },
  ]
}

const outcome: Select = {
  type: 'select',
  name: 'outcome',
  choices: [
    { name: 'Yes' },
    { name: 'No' },
  ]
}

const questionId = input('id', 'Question Id');


/////////////////////////////////////////////////////////////////////////////////////////
// Thunks

const oracleCreate: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {
  try {
    const res = await lib.oracleCreate();
    dispatch(createFulfilled('create', res));
  } catch (err: any) {
    dispatch(displayMsg(err.message || 'oracleCreate error'));
  }
}

const oracleResolve: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {
  const state = getState();
  if (state.oracleTx) {
    try {
      const res = await lib.oracleResolve(state.oracleTx, t as any);
      dispatch(displayMsg(res));
    } catch (err: any) {
      dispatch(displayMsg(err.message || 'oracleResolve error'));
    }
  } else {
    dispatch(displayMsg('First create oracle, then resolve.'));
  }
}

const updateOutcomeInDb: ThunkCreator<AppState> = createThunk((t, p) => lib.updateOutcomeInDb(p.id, p.outcome));

const oracleClose: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {
  const state = getState();
  if (state.oracleTx) {
    try {
      const res = await lib.oracleClose(state.oracleTx);
      dispatch(createFulfilled<{tx: string}>(t, res));
    } catch (err: any) {
      dispatch(displayMsg(err.message || 'oracleClose error'));
    }
  } else {
    dispatch(displayMsg('First create oracle, then close.'));
  }
}

const questionCreate: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {
  const state = getState();
  if (state.oracleTx) {
    const q: lib.QuestionNew = {
      ...p,
      categories: (p.categories || '').split(',').map((i: string) => i.trim()),
    }
    try {
      const res = await lib.questionCreate(q);
      dispatch(displayMsg(res));
    } catch (err: any) {
      dispatch(displayMsg(err.message || 'questionCreate error'));
    }
  } else {
    dispatch(displayMsg('First create oracle, then question.'));
  }
}

const questionDelete: ThunkCreator<AppState> = createThunk((t, p) => lib.questionDelete(p));

const rmWaitingOps: ThunkCreator<AppState> = createThunk((t, p) => lib.removeWaitingOperations(p));

const getById: ThunkCreator<AppState> = createThunk((t, p) => lib.getQuestionById(p));

const listQuestions: ThunkCreator<AppState> = createThunk((t, p) => lib.listQuestions(t as any));


/////////////////////////////////////////////////////////////////////////////////////////
// Config

const configSetup: TreeConfig<AppState> = [
  ['oracle', [
    ['create', oracleCreate],
    ['resolve', oracleResolve, [
      'Yes',
      'No'
    ]],
    ['updateOutcomeInDb', 'Update outcome in DB',
      [seq([
        input('id'),
        outcome,
      ]), updateOutcomeInDb]],
    ['close', oracleClose],
  ]],
  ['questions', [
    ['create', [questionForm, questionCreate]],
    ['delete', [questionId, questionDelete]],
    ['rmWaitingOps', 'Remove Waiting Operations',
      [questionId, rmWaitingOps]],
    ['getById', 'Get By Id', [questionId, getById]],
    ['list', listQuestions, [
      'open',
      'completed',
      'all',
    ]],
  ]]
];

export const config = normalizeConfig(configSetup);
