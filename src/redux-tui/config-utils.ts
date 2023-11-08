import { ConfigParams, ConfigItem, Config, ConfigItemParams, Children, Interaction, ActionFn, NextAction } from "./types/config";
import { PromptWithAction, Prompt, Select, createInteraction } from "./types/interactions";

const getNextAction = (i: Children): NextAction => i instanceof Array
  ? normalizeConfig(i)
  : typeof i === 'function'
    ? i
    : i.type === 'promptWithAction'
      ? i
      : createInteraction(i);

const mapper = (item: ConfigItemParams): ConfigItem => {
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
        const action = typeof item[1] === 'string' 
          ? undefined 
          : getNextAction(item[1]);
        const message = typeof item[1] === 'string' ? item[1]: undefined;
        return {
          name: item[0],
          message,
          nextAction: action,
        };
      
      case 3:
        return {
          name: item[0],
          message: item[1],
          nextAction: getNextAction(item[2]),
        };

      default:
        throw new Error();
    }
  } else {
    return {
      ...item,
      nextAction: getNextAction(item.nextAction),
    };
  }
}

export const normalizeConfig = (config: ConfigParams): Config => {
  return config.map(mapper)
}

const getInteractionCfgByPath = (config: Config, path: string[]): ConfigItem | undefined => {
  let list: Config = config;
  let node: ConfigItem | undefined;
  for (let i=0; i < path.length; i++) {
    node = list.find(j => j.name === path[i])
    if (node === undefined) {
      return undefined;
    }
    if (!(node.nextAction instanceof Array) && i < path.length-1) {
      return undefined;
    }
    list = node.nextAction instanceof Array ? node.nextAction : list;
  }
  return node;
}

export const getInteraction = (config: Config, path: string[]): PromptWithAction | undefined => {
  const cfg: ConfigItem | undefined = path.length === 0
    ? { // ToDo: rewrite
      name: 'main',
      message: 'Start',
      nextAction: config
    }
    : getInteractionCfgByPath(config, path);

  if (cfg === undefined) {
    throw new Error("");
  }
  if (cfg.nextAction === undefined) {
    return undefined;
  } else if (cfg.nextAction instanceof Array) {
    const select: Select = {
      type: 'select',
      name: cfg.name,
      message: cfg.message,
      choices: cfg.nextAction.map(i => ({ name: i.name, message: i.message }))
    }
    return createInteraction(select);
  } else if (typeof cfg.nextAction === 'object') {
    return cfg.nextAction;
  } else {
    throw new Error("");
  }
}

export const isPathInConfig = (config: Config, path: string[]): boolean => {
  let current: NextAction | undefined = config;
  for (let i=0; i < path.length; i++) {
    if (current === undefined || !(current instanceof Array)) {
      return false;
    }
    const name = path[i];
    const item: ConfigItem | undefined = current.find(i => i.name === name);
    if (item === undefined) {
      return false;
    }
    current = item.nextAction;
  }
  return true;
}