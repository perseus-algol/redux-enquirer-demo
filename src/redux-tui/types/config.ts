import { Interaction, Prompt, SelectOption } from "./interactions";

type ConfigItemParams = 
  | string
  | [string]
  | [string, string | Prompt | Interaction | ConfigParams] 
  | [string, string, Prompt | Interaction | ConfigParams]
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
  action?: Prompt | Interaction | Config
}

export type Config = ConfigItem[];
