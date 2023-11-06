import { Prompt, SelectOption } from "./interactions";

type ConfigItemParams = 
  | string
  | [string]
  | [string, string | Prompt | Config] 
  | [string, string, Prompt | Config]
  | {
    type: 'configItem',
    name: string,
    message?: string,
    action: Prompt | Config
  };

export type Config = ConfigItemParams[];

export type ConfigItemStrict = {
  type: 'configItem',
  name: string,
  message?: string,
  action?: Prompt | ConfigStrict
}

export type ConfigStrict = ConfigItemStrict[];
