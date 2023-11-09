import { Prompt } from "../config/types/prompts";
import enquirer from 'enquirer';

const selectItems = {
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
