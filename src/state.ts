import { Config } from "./redux-tui/types/config";
import { Form, Input, Prompt, Select, SelectOption, input, seq } from "./redux-tui/types/interactions";

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

const questionId = input('id', 'Question Id');

const outcome: Select = {
  type: 'select',
  name: 'outcome',
  choices: [
    { name: 'Yes' },
    { name: 'No' },
  ]
}

export const config: Config = [
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
    ['create', questionForm],
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
