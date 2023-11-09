import { ThunkCreator } from "./config-common"
import { PromptWithAction } from "./interactions"

export type InteractionTreeItem<S> = {
  name: string,
  message?: string,
  thunk?: ThunkCreator<S>,
  children?: InteractionTree<S> | PromptWithAction<S>
}

export type InteractionTree<S> = InteractionTreeItem<S>[];
