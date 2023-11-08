import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { ActionFn, Config, ConfigItem } from "./types/config";
import { TuiState } from "./createReducer";
import redux, { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getInteraction, getInteractionCfgByPath } from "./config-utils";
import { enhancePrompt, handlePrompt, selectItems } from "./handleInteraction";
import { Prompt, PromptWithAction, Select } from "./types/interactions";
import { isObject } from "./utils";

const handleAnyPrompt = (
  prompt: Prompt,
  actionFn?: ActionFn,
) => (answer: any) => {
  console.log('answer: ', answer);
  const payload = prompt.type === 'sequence'
    ? answer
    : answer[prompt.name];
  
  const actionCreator = actionFn
    ? createAsyncThunk(prompt.name, actionFn)
    : createAction<any>(
      prompt.type === 'sequence' 
        ? prompt.type
        : answer[prompt.name]
    );
  return actionCreator(payload);
}

const handleSelectPrompt = (
  select: Select,
  options: Config,
) => (answer: any) => {
  const actionType = answer[select.name];
  if (typeof actionType !== 'string') {
    throw new Error("");
  }
  
  const selected = options.find(i => i.name === actionType);
  if (selected && typeof selected.nextAction === 'function') {
    return createAsyncThunk<void>(actionType, selected.nextAction)();
  }

  return createAction<void>(actionType)();
}

export class View {
  constructor(
    private interactionTree: Config,
    private store: ToolkitStore<TuiState, redux.AnyAction, [redux.ThunkMiddleware<TuiState, redux.AnyAction>]>
  ) {}

  private get state () {
    return this.store.getState();
  }

  private getCfgItem (): ConfigItem {
    const path = this.state.stack;
    const cfg: ConfigItem | undefined = path.length === 0
      ? { // ToDo: rewrite
        name: 'main',
        message: 'Start',
        nextAction: this.interactionTree
      }
      : getInteractionCfgByPath(this.interactionTree, path);

    if (cfg === undefined) {
      throw new Error("");
    }
    return cfg;
  }

  private async handlePrompt (prompt: Prompt, onSuccess: (answer: any) => any): Promise<any> {
    const result = await handlePrompt(prompt);
    if (result.type === 'cancelled') {
      return createAction<void>('back')(); // ToDo: hardcoded action type
    } else if (result.type === 'exit') {
      return createAction<void>('exit')(); // ToDo: hardcoded action type
    } else if (result.type === 'success') { // this redundancy needed for typescript type infering
      return onSuccess(result.answer);
    }
  }

  private async handleInteraction () {
    const cfgItem: ConfigItem = this.getCfgItem();
    //const interactionFromConfig = getInteraction(cfgItem);

    if (this.state.prompt) {
      const prompt = this.state.prompt;
      enhancePrompt(prompt);
      return this.handlePrompt(prompt, handleAnyPrompt(prompt))
    } else if(cfgItem.nextAction instanceof Array) {
      const select: Select = {
        type: 'select',
        name: cfgItem.name,
        message: cfgItem.message,
        choices: cfgItem.nextAction.map(i => ({ name: i.name, message: i.message }))
      }
      enhancePrompt(select);
      return this.handlePrompt(select, handleSelectPrompt(select, cfgItem.nextAction))
    } else if (typeof cfgItem.nextAction === 'object') {
      const prompt = cfgItem.nextAction.prompt;
      return this.handlePrompt(prompt, handleAnyPrompt(prompt, cfgItem.nextAction.action))
    }
    return undefined;
  }

  render = async () => {
    const state = this.store.getState();
    const action = await this.handleInteraction();
    
    if (action) {
      this.store.dispatch(action);
    }
  }
}