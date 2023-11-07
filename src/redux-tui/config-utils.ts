import { ConfigParams, ConfigItem, Config } from "./types/config";
import { Interaction, Prompt, Select } from "./types/interactions";

export const normalizeConfig = (config: ConfigParams): Config => {
  const getAction = (i: Prompt | Interaction | ConfigParams) => i instanceof Array ? normalizeConfig(i) : i;
  return config.map(item => {
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
            : getAction(item[1]);
          const message = typeof item[1] === 'string' ? item[1]: undefined;
          return {
            name: item[0],
            message,
            action,
          };
        
        case 3:
          return {
            name: item[0],
            message: item[1],
            action: getAction(item[2]),
          };

        default:
          throw new Error();
      }
    } else {
      return {
        ...item,
        action: getAction(item.action),
      };
    }
  })
}

const getInteractionCfgByPath = (config: Config, path: string[]): ConfigItem | undefined => {
  let list: Config = config;
  let node: ConfigItem | undefined;
  for (let i=0; i < path.length; i++) {
    node = list.find(j => j.name === path[i])
    if (node === undefined) {
      return undefined;
    }
    if (!(node.action instanceof Array) && i < path.length-1) {
      return undefined;
    }
    list = node.action instanceof Array ? node.action : list;
  }
  return node;
}

export const getInteraction = (config: Config, path: string[]) => {
  const cfg = path.length === 0
    ? { // ToDo: rewrite
      name: 'main',
      message: 'Start',
      action: config
    }
    : getInteractionCfgByPath(config, path);

  if (cfg === undefined) {
    return undefined;
  }
  if (cfg.action === undefined) {
    return undefined;
  } else if (cfg.action instanceof Array) {
    const select: Select = {
      type: 'select',
      name: cfg.name,
      message: cfg.message,
      choices: cfg.action.map(i => ({ name: i.name, message: i.message }))
    }
    return select;
  } else if (typeof cfg.action === 'object') {
    return cfg.action;
  } else {
    throw new Error("");
  }
}

export const isPathInConfig = (config: Config, path: string[]): boolean => {
  let current: Config | Prompt | undefined = config;
  for (let i=0; i < path.length; i++) {
    if (current === undefined || !(current instanceof Array)) {
      return false;
    }
    const name = path[i];
    const item: ConfigItem | undefined = current.find(i => i.name === name);
    if (item === undefined) {
      return false;
    }
    current = item.action;
  }
  return true;
}