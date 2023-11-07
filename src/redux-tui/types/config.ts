import { Prompt, SelectOption } from "./interactions";

type ConfigItemParams = 
  | string
  | [string]
  | [string, string | Prompt | ConfigParams] 
  | [string, string, Prompt | ConfigParams]
  | {
    type: 'configItem',
    name: string,
    message?: string,
    action: Prompt | ConfigParams
  };

export type ConfigParams = ConfigItemParams[];

export type ConfigItem = {
  type: 'configItem',
  name: string,
  message?: string,
  action?: Prompt | Config
}

export type Config = ConfigItem[];
