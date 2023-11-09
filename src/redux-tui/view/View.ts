import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { TuiState } from "../createReducer";
import redux, { createAction } from '@reduxjs/toolkit';
import { getInteractionCfgByPath } from "../config";
import { enhancePrompt, handlePrompt } from "./handleInteraction";
import { Prompt, Select } from "../config/types/prompts";
import { ThunkCreator } from "../config/types/config-common";
import { InteractionTree, InteractionTreeItem } from "../config/types/config-strict";

const handleAnyPrompt = <S>(
  prompt: Prompt,
  thunkCreator?: ThunkCreator<S>,
) => (answer: any) => {
  console.log('answer: ', answer);
  const typePrefix = prompt.name;
  const payload = answer[prompt.name];

  const actionCreator = thunkCreator
    ? thunkCreator(typePrefix)
    : createAction<void>(typePrefix);
  
  return actionCreator(payload);
}

const handleSelectPrompt = <S>(
  select: Select,
  treeItem: InteractionTreeItem<S>,
) => (answer: any) => {
  const typePrefix = answer[select.name];
  if (typeof typePrefix !== 'string') {
    throw new Error("");
  }
  if (!(treeItem.children instanceof Array)) {
    throw new Error("");
  }
  
  const selected = treeItem.children.find(i => i.name === typePrefix);
  if (selected) {
    if (selected.thunk) {
      return selected.thunk(typePrefix)();
    } else if (treeItem.thunk) {
      return treeItem.thunk(typePrefix)();
    }
  }

  return createAction<void>(typePrefix)();
}

export class View<S> {
  constructor(
    private interactionTree: InteractionTree<S>,
    private store: ToolkitStore<TuiState, redux.AnyAction, [redux.ThunkMiddleware<TuiState, redux.AnyAction>]>
  ) {}

  private get state () {
    return this.store.getState();
  }

  private getCfgItem (): InteractionTreeItem<S> {
    const path = this.state.stack;
    const cfg: InteractionTreeItem<S> | undefined = path.length === 0
      ? { // ToDo: rewrite
        name: 'main',
        message: 'Start',
        children: this.interactionTree
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
    const cfgItem: InteractionTreeItem<S> = this.getCfgItem();

    if (this.state.prompt) {
      const prompt = this.state.prompt;
      enhancePrompt(prompt);
      return this.handlePrompt(prompt, handleAnyPrompt(prompt));
    } else if(cfgItem.children instanceof Array) {
      const select: Select = {
        type: 'select',
        name: cfgItem.name,
        message: cfgItem.message,
        choices: cfgItem.children.map(i => ({ name: i.name, message: i.message }))
      }
      enhancePrompt(select);
      return this.handlePrompt(select, handleSelectPrompt(select, cfgItem))
    } else if (
        typeof cfgItem.children === 'object' 
        && cfgItem.children.type === 'promptWithAction'
      ) {
      const prompt = cfgItem.children.prompt;
      return this.handlePrompt(prompt, handleAnyPrompt(prompt, cfgItem.children.thunk))
    }
    return undefined;
  }

  private display () {
    const display = this.state.display;
    if (display) {
      const s = typeof display === 'string'
        ? display
        : JSON.stringify(display);
      console.log(s);
    }
  }

  render = async () => {
    this.display();

    const action = await this.handleInteraction();
    if (action) {
      this.store.dispatch(action);
    }
  }
}