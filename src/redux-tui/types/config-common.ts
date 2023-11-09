import { Action, ThunkAction } from "@reduxjs/toolkit";

export type ThunkCreator<S> = (typePrefix: string) => (payload?: any) => ThunkAction<void, S, unknown, Action>;