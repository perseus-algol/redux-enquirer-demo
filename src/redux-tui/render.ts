import { Dispatch, createAction } from "@reduxjs/toolkit";
import { Prompt } from "./types/interactions";
import cloneDeep from 'lodash.clonedeep';
import enquirer from 'enquirer';

const { Select, Input, Separator } = (enquirer as any);
const { prompt } = enquirer;

const handleInteraction = async (dispatch: Dispatch, interaction?: Prompt) => {
  if (!interaction) {
    return;
  }
  
  if (interaction.type === 'sequence') {
    const a: any = await prompt(cloneDeep(interaction.sequence) as any);
    const action = createAction<any>('sequence');
    dispatch(action(a));
  } else {
    if (interaction.type === 'select') {
      interaction.choices.push({
        name: 'separator',
        role: 'separator'
      }, {
        name: 'back',
        message: 'Back'
      })
    }
    const a: any = await prompt(cloneDeep(interaction) as any);
    const action = createAction<any>(a[interaction.name]);
    dispatch(action(a));
  }
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
