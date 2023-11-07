import { Interaction, Prompt, SelectOption } from "./interactions";

// Flexible form for convenient configuration

type ConfigItemParams = 
  | string
  | [string]
  | [string, string | Prompt | Interaction | ConfigParams] 
  | [string, string, Prompt | Interaction | ConfigParams]
  | {
    name: string,
    message?: string,
    action: Prompt | ConfigParams
  };

export type ConfigParams = ConfigItemParams[];

// Strict Form

export type ConfigItem = {
  name: string,
  message?: string,
  action?: Interaction | Config
}

export type Config = ConfigItem[];
