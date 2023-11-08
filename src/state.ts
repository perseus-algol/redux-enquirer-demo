import { normalizeConfig } from "./redux-tui/config-utils";
import { ConfigParams } from "./redux-tui/types/config";
import { Form, Input, Prompt, Select, SelectOption, createInteraction, input, seq } from "./redux-tui/types/interactions";
import * as lib from './lib';

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

type QuestionsFilter = 'open' | 'completed' | 'all';

const fetchQuestions = async (form: any) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({...form, tx: '1010101010101010'});
    }, 1000);
  });
};

const questionFormInter = createInteraction(questionForm, fetchQuestions);

const questionId = input('id', 'Question Id');

const outcome: Select = {
  type: 'select',
  name: 'outcome',
  choices: [
    { name: 'Yes' },
    { name: 'No' },
  ]
}

const configSetup: ConfigParams = [
  ['oracle', [
    ['create'],
    ['resolve', [
      'Yes',
      'No'
    ]],
    ['resolveInDb', seq([
      input('id'),
      outcome,
    ])],
    ['close'],
  ]],
  ['questions', [
    ['create', questionFormInter],
    ['delete', questionId],
    ['rmWaitingOps', questionId],
    ['getById', questionId],
    ['list', [
      'open',
      'completed',
      'all',
    ]],
  ]]
];

export const config = normalizeConfig(configSetup);
