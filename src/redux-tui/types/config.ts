import { PromptWithAction, Prompt, SelectOption } from "./interactions";

export type ActionFn = (arg?: any) => void;

export type Interaction = Prompt | PromptWithAction | ActionFn


// Flexible form for convenient configuration

export type Children = Interaction | ConfigParams

export type ConfigItemParams =
  | string
  | [string]
  | [string, string | Children]
  | [string, string, Children]
  | {
    name: string,
    message?: string,
    nextAction: Children
  };

export type ConfigParams = ConfigItemParams[];

// Strict Form
export type NextAction = PromptWithAction | ActionFn | Config

export type ConfigItem = {
  name: string,
  message?: string,
  nextAction?: NextAction
}

export type Config = ConfigItem[];
