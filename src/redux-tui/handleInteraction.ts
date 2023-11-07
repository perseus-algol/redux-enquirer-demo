import { Action, Dispatch, createAction, createAsyncThunk, freeze } from "@reduxjs/toolkit";
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

export const handleInteraction = async (interaction: Prompt): Promise<any> => {
  if (interaction.type === 'select') {
    interaction.choices.push(selectItems.separator, selectItems.back);
  }

  const whatToPromt = interaction.type === 'sequence'
    ? interaction.sequence
    : interaction;

  return await prompt(whatToPromt as any);
}
