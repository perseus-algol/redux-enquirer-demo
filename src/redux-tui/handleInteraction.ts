import { Action, Dispatch, createAction, createAsyncThunk, freeze } from "@reduxjs/toolkit";
import { PromptWithAction, Prompt } from "./types/interactions";
import cloneDeep from 'lodash.clonedeep';
import enquirer from 'enquirer';

const { Select, Input, Separator } = (enquirer as any);

export const selectItems = {
  separator: {
    name: 'separator',
    role: 'separator'
  },
  back: {
    name: 'back',
    message: 'Back'
  },
  exit: {
    name: 'exit',
    message: 'Exit'
  }
};

export const enhancePrompt = (prompt: Prompt) => {
  if (prompt.type === 'select') {
    prompt.choices.push(selectItems.separator);
    if (prompt.name === 'main') { // ToDo: hardcoded value, bad way to know if we are on top. May be we can just use Back and exit in reduccer on condition if stack === []?
      prompt.choices.push(selectItems.exit);
    } else {
      prompt.choices.push(selectItems.back);
    }
  }
}

class CancelError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

type Result = 
  | {
    type: 'success',
    answer: any
  }
  | {
    type: 'cancelled' | 'exit'
  }

export const handlePrompt = async (prompt: Prompt): Promise<Result> => {
  const whatToPromt: any = prompt.type === 'sequence'
    ? prompt.sequence
    : prompt;

  let status: Result["type"] = 'success';
  whatToPromt.onCancel = function () {
    status = this.state.keypress.sequence === '\x03' ? 'exit' : 'cancelled';
  }

  try {
    const answer = await enquirer.prompt(whatToPromt);
    return { type: 'success', answer }
  } catch(err) {
    if (status !== 'success') {
      return { type: status };
    } else {
      throw err;
    }
  }
}

// export const handleInteraction = async (prompt?: Prompt, interaction?: PromptWithAction): Promise<any> => {
//   prompt = prompt
//     ? prompt 
//     : interaction !== undefined
//       ? interaction.prompt 
//       : undefined;

//   if (prompt) {
//     enhancePrompt(prompt);
//     const result = await handlePrompt(prompt);
//     if (result.type === 'cancelled') {
//       return createAction<void>('back')(); // ToDo: hardcoded action type
//     } else if (result.type === 'exit') {
//       return createAction<void>('exit')(); // ToDo: hardcoded action type
//     } else if (result.type === 'success') { // this redundancy needed for typescript type infering
//       const answer = result.answer;
//       console.log('answer: ', answer);
//       const payload = prompt.type === 'sequence'
//         ? answer
//         : answer[prompt.name];
//       const actionCreator = interaction?.action
//         ? createAsyncThunk(prompt.name, interaction.action)
//         : createAction<any>(
//           prompt.type === 'sequence' 
//             ? prompt.type
//             : answer[prompt.name]
//         );
//       return actionCreator(payload);
//     }
//   }
// }