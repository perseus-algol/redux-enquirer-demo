import { Dispatch, createAction, createAsyncThunk, freeze } from "@reduxjs/toolkit";
import { Prompt } from "./types/interactions";
import cloneDeep from 'lodash.clonedeep';
import enquirer from 'enquirer';

const { Select, Input, Separator } = (enquirer as any);
const { prompt } = enquirer;

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

const handleInteraction = async (dispatch: Dispatch, interaction?: Prompt) => {
  if (!interaction) {
    return;
  }

  if (interaction.type === 'select') {
    interaction.choices.push(selectItems.separator, selectItems.back);
  }

  const whatToPromt = interaction.type === 'sequence'
    ? interaction.sequence
    : interaction;

  const a: any = await prompt(whatToPromt as any);
  
  const actionType = interaction.type === 'sequence'
    ? interaction.type
    : a[interaction.name];

  const action = createAction<any>(actionType);
  dispatch(action(a));
}

export const render = async (p: {
  dispatch: Dispatch,
  interaction?: Prompt,
  display?: string,
}) => {
  if (p.display) {
    console.log(p.display);
  }
  await handleInteraction(p.dispatch, cloneDeep(p.interaction));
}
