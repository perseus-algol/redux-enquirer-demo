import { Action, ThunkAction } from "@reduxjs/toolkit";

export type AppThunk<S> = ThunkAction<void, S, unknown, Action>;
export type ThunkCreator<S> = (typePrefix: string) => (payload?: any) => AppThunk<S>;