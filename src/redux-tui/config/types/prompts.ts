import { ThunkCreator } from "./config-common";

type PromptBase = {
  name: string,
  message?: string,
}

export type Input = PromptBase & {
  type: 'input',
  initial?: string,
  show?: boolean,
}

export type SelectOption = {
  name: string,
  message?: string,
  enabled?: boolean,
  role?: string,
}

export type Select = PromptBase & {
  type: 'select',
  choices: SelectOption[]
}

export type Form = PromptBase & {
  type: 'form',
  choices: Array<{
    name: string,
    message?: string,
    initial?: string,
  }>
}

export type Sequence = PromptBase & {
  type: 'sequence',
  sequence: Array<Prompt>
}

export type Prompt = 
  | Input
  | Select
  | Form
  | Sequence

// Interaction

export type PromptWithAction<S> = {
  type: 'promptWithAction'
  prompt: Prompt,
  thunk?: ThunkCreator<S>
}
