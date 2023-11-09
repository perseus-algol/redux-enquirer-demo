import { normalizeConfig } from "./redux-tui/config";
import { Form, Select } from "./redux-tui/config/types/prompts";
import { input, seq } from "./redux-tui/config/prompt-creators";
import * as lib from './lib';
import { TuiState } from "./redux-tui/createReducer";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ThunkCreator } from "./redux-tui/config/types/config-common";
import { TreeConfig } from "./redux-tui/config/types/config-flexible";

type Tx = string;

export type AppState = TuiState & {
  oracleTx?: Tx;
}

type QuestionsFilter = 'open' | 'completed' | 'all';


/////////////////////////////////////////////////////////////////////////////////////////
// Prompts

const questionForm: Form = {
  type: 'form',
  name: 'question',
  choices: [
    { name: 'question' },
    { name: 'desc' },
    { name: 'image' },
    { name: 'categories' },
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

const oracleCreate: ThunkCreator<AppState> = t => createAsyncThunk(t, lib.oracleCreate)

const oracleResolve: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {}

const resolveInDb: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {}

const questionCreate: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {}

const questionDelete: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {}

const rmWaitingOps: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {}

const getById: ThunkCreator<AppState> = t => p => async (dispatch, getState) => {}

const listQuestions: ThunkCreator<AppState> = t => createAsyncThunk(t, async (filter: QuestionsFilter) => {
  return lib.listQuestions(filter);
});


/////////////////////////////////////////////////////////////////////////////////////////
// Config

const configSetup: TreeConfig<AppState> = [
  ['oracle', [
    ['create', oracleCreate],
    ['resolve', oracleResolve, [
      ['Yes'],
      ['No']
    ]],
    ['resolveInDb', 'Resolve In DB',
      [seq([
        input('id'),
        outcome,
      ]), resolveInDb]],
    ['close'],
  ]],
  ['questions', [
    ['create', [questionForm, questionCreate]],
    ['delete', [questionId, questionDelete]],
    ['rmWaitingOps', 'Remove Waiting Operations',
      [questionId, rmWaitingOps]],
    ['getById', 'Get By Id', [questionId, getById]],
    ['list', listQuestions, [
      ['open'],
      ['completed'],
      ['all'],
    ]],
  ]]
];

export const config = normalizeConfig(configSetup);
