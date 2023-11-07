import { ConfigParams, ConfigItem, Config } from "./types/config";
import { Prompt, Select } from "./types/interactions";

export const isPrompt = (i: Prompt | Array<any>): i is Prompt => !(i instanceof Array)

export const normalizeConfig = (config: ConfigParams): Config => {
  const getAction = (i: Prompt | ConfigParams) => isPrompt(i) ? i : normalizeConfig(i);
  return config.map(item => {
    if (typeof item === 'string') {
      return {
        type: 'configItem',
        name: item,
      };
    } else if (item instanceof Array) {
      switch (item.length) {
        case 1:
          return {
            type: 'configItem',
            name: item[0],
          };

        case 2:
          const action = typeof item[1] === 'string' 
            ? undefined 
            : getAction(item[1]);
          const message = typeof item[1] === 'string' ? item[1]: undefined;
          return {
            type: 'configItem',
            name: item[0],
            message,
            action,
          };
        
        case 3:
          return {
            type: 'configItem',
            name: item[0],
            message: item[1],
            action: getAction(item[2]),
          };

        default:
          throw new Error();
      }
    } else if (item.type === 'configItem') {
      return {
        ...item,
        action: getAction(item.action),
      };
    } else {
      throw new Error();
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
  const cfg = getInteractionCfgByPath(config, path);
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