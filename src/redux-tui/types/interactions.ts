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

export type Interaction = {
  type: 'interaction'
  prompt: Prompt,
  action: (args: any) => void
}

// Prompt Factories

export const input = (name: string, message?: string): Input => ({
  type: 'input',
  name,
  message
});

export const seq = (prompts: Prompt[], name = 'sequence'): Sequence => ({
  type: 'sequence',
  name,
  sequence: prompts
});

export const createInteraction = (prompt: Prompt, action: any = undefined): Interaction => ({
  type: 'interaction',
  prompt,
  action
});