import { ThunkCreator } from "./types/config-common";
import { Children, PromptConfig, TreeConfig, TreeConfigItem } from "./types/config-flexible";
import { InteractionTree, InteractionTreeItem } from "./types/config-strict";
import { PromptWithAction, Prompt, Select, createInteraction } from "./types/interactions";
import { isObject } from "./utils";

const capital1st = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const isPromptConfig = <S>(value: any): value is PromptConfig<S> => {
  if (value instanceof Array) {
    if (value.length === 2 
      && isObject(value[0]) 
      && value[0].type 
      && typeof value[1] === 'function'
    ) {
      return true;
    }
  } else if (value instanceof Object) {
    return true;
  }
  
  return false;
}

const createPromptWithAction = <S>(value: PromptConfig<S>): PromptWithAction<S> | undefined => {
  if (value instanceof Array) {
    if (value.length === 2 
      && isObject(value[0]) 
      && value[0].type 
      && typeof value[1] === 'function'
    ) {
      return createInteraction(value[0], value[1]);
    }
  } else if (value instanceof Object) {
    if (value.type === 'promptWithAction') {
      return value;
    }
    return createInteraction(value);
  }
  
  throw new Error("createPromptWithAction");
}

const from2options = <S>(items: 
  | [string, ThunkCreator<S>]
  | [string, string]
  | [string, Children<S>]
): InteractionTreeItem<S> => {
  const [name, option] = items;
  if (typeof name !== 'string') {
    throw new Error("String expected");
  }
  const message = capital1st(name); // ToDo: Extract this feature from here

  if (typeof option === 'function') {
    return {
      name,
      message,
      thunk: option,
    }
  } else if (typeof option === 'string') {
    return {
      name,
      message: option,
    }
  }
  
  if (isPromptConfig<S>(option)) {
    return {
      name,
      message,
      children: createPromptWithAction<S>(option)
    };
  } else {
    return {
      name,
      message,
      children: normalizeConfig<S>(option)
    }
  }
}

const from3options = <S>(items:
  | [string, string, ThunkCreator<S>]
  | [string, string, Children<S>]
  | [string, ThunkCreator<S>, Children<S>]
): InteractionTreeItem<S> => {
  const [name, msgOrThunk, thunkOrChildren] = items;
  if (typeof name !== 'string') {
    throw new Error("String expected");
  }

  if (typeof msgOrThunk === 'string') {
    if (typeof thunkOrChildren === 'function') {
      return {
        name,
        message: msgOrThunk,
        thunk: thunkOrChildren
      };
    } else {
      if (isPromptConfig<S>(thunkOrChildren)) {
        return {
          name,
          message: msgOrThunk,
          children: createPromptWithAction<S>(thunkOrChildren)
        };
      } else {
        return {
          name,
          message: msgOrThunk,
          children: normalizeConfig<S>(thunkOrChildren)
        }
      }
    }
  } else if (typeof msgOrThunk === 'function') {
    if (thunkOrChildren instanceof Array && !isPromptConfig<S>(thunkOrChildren)) {
      return {
        name,
        message: capital1st(name), // ToDo: Extract this feature from here
        thunk: msgOrThunk,
        children: normalizeConfig<S>(thunkOrChildren)
      };
    }
  }
  throw new Error("");
}

const mapper = <S>(item: TreeConfigItem<S>): InteractionTreeItem<S> => {
  if (typeof item === 'string') {
    return {
      name: item,
    };
  } else if (item instanceof Array) {
    switch (item.length) {
      case 1:
        return {
          name: item[0],
        };

      case 2:
        return from2options(item);
      
      case 3:
        return from3options(item);

      default:
        throw new Error("");
    }
  } else {
    throw new Error("");
  }
}

export const normalizeConfig = <S>(config: TreeConfig<S>): InteractionTree<S> => {
  return config.map(mapper);
}

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