// Flexible form for convenient configuration

import { ThunkCreator } from "./config-common"
import { Prompt, PromptWithAction } from "./prompts"

/*
- We have three of options
- Leafs can also be: Prompt or Prompt with thunk
- Every text element can hold thunk.
*/

export type PromptConfig<S> = PromptWithAction<S> | Prompt | [Prompt, ThunkCreator<S>]
export type Children<S> = TreeConfig<S> | PromptConfig<S>

export type TreeConfigItem<S> =
  // name
  | string
  | [string]                                       // 1
  | [string, ThunkCreator<S>]                      // 2
  | [string, Children<S>]                          // 2
  | [string, ThunkCreator<S>, Children<S>]         // 3
  // name, message
  | [string, string]                               // 2
  | [string, string, ThunkCreator<S>]              // 3
  | [string, string, Children<S>]                  // 3
  | [string, string, ThunkCreator<S>, Children<S>] // 4

export type TreeConfig<S> = TreeConfigItem<S>[]
