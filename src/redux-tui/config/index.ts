import { InteractionTree, InteractionTreeItem } from "./types/config-strict";
import { PromptWithAction, Select } from "./types/prompts";
import { createInteraction } from "./prompt-creators";


export const getInteractionCfgByPath = <S>(config: InteractionTree<S>, path: string[]): InteractionTreeItem<S> | undefined => {
  let list: InteractionTree<S> = config;
  let node: InteractionTreeItem<S> | undefined;
  for (let i=0; i < path.length; i++) {
    node = list.find(j => j.name === path[i])
    if (node === undefined) {
      return undefined;
    }
    if (!(node.children instanceof Array) && i < path.length-1) {
      return undefined;
    }
    list = node.children instanceof Array ? node.children : list;
  }
  return node;
}

export const getInteraction = <S>(cfg: InteractionTreeItem<S>): PromptWithAction<S> | undefined => {
  if (cfg.children === undefined) {
    return undefined;
  } else if (cfg.children instanceof Array) {
    const select: Select = {
      type: 'select',
      name: cfg.name,
      message: cfg.message,
      choices: cfg.children.map(i => ({ name: i.name, message: i.message }))
    }
    return createInteraction(select);
  } else if (typeof cfg.children === 'object') {
    return cfg.children;
  } else {
    throw new Error("");
  }
}

export const getInteractionByPath = <S>(config: InteractionTree<S>, path: string[]): PromptWithAction<S> | undefined => {
  const cfg: InteractionTreeItem<S> | undefined = path.length === 0
    ? { // ToDo: rewrite
      name: 'main',
      message: 'Start',
      children: config
    }
    : getInteractionCfgByPath(config, path);

  if (cfg === undefined) {
    throw new Error("");
  }
  return getInteraction(cfg);
}

export const isPathInConfig = <S>(config: InteractionTree<S>, path: string[]): boolean => {
  let current: InteractionTree<S> | PromptWithAction<S> | undefined = config;
  for (let i=0; i < path.length; i++) {
    if (current === undefined || !(current instanceof Array)) {
      return false;
    }
    const name = path[i];
    const item: InteractionTreeItem<S> | undefined = current.find(i => i.name === name);
    if (item === undefined) {
      return false;
    }
    current = item.children;
  }
  return true;
}

export * from './normalizeConfig';
