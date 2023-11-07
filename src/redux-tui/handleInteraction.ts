import { Action, Dispatch, createAction, createAsyncThunk, freeze } from "@reduxjs/toolkit";
import { Interaction, Prompt } from "./types/interactions";
import cloneDeep from 'lodash.clonedeep';
import enquirer from 'enquirer';

const { Select, Input, Separator } = (enquirer as any);

const selectItems = {
  separator: {
    name: 'separator',
    role: 'separator'
  },
  back: {
    name: 'back',
    message: 'Back'
  }
};

export const handlePrompt = async (prompt: Prompt): Promise<any> => {
  if (prompt.type === 'select') {
    prompt.choices.push(selectItems.separator, selectItems.back);
  }

  const whatToPromt = prompt.type === 'sequence'
    ? prompt.sequence
    : prompt;

  return await enquirer.prompt(whatToPromt as any);
}

export const handleInteraction = async (prompt?: Prompt, interaction?: Interaction): Promise<any> => {
  prompt = prompt
    ? prompt 
    : interaction !== undefined
      ? interaction.prompt 
      : undefined;

  if (prompt) {
    const answer = await handlePrompt(prompt);
    const payload = prompt.type === 'sequence'
      ? answer
      : answer[prompt.name];
    const actionCreator = interaction?.action
      ? createAsyncThunk(prompt.name, interaction.action)
      : createAction<any>(
        prompt.type === 'sequence' 
          ? prompt.type
          : answer[prompt.name]
      );
    return actionCreator(payload);
  }
}