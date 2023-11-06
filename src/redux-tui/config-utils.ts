import { Config, ConfigStrict } from "./types/config";
import { Prompt } from "./types/interactions";

export const isPrompt = (i: Prompt | Array<any>): i is Prompt => !(i instanceof Array)

export const normalizeConfig = (config: Config): ConfigStrict => {
  const getAction = (i: Prompt | Config) => isPrompt(i) ? i : normalizeConfig(i);
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