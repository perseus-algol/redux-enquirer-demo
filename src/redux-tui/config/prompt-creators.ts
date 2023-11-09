import { Input, Prompt, PromptWithAction, Sequence } from "./types/prompts";

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

export const createInteraction = <S>(prompt: Prompt, thunk: any = undefined): PromptWithAction<S> => ({
  type: 'promptWithAction',
  prompt,
  thunk,
});
