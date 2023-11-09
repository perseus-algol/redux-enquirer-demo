import { TuiState } from "../redux-tui/createReducer";

type Tx = string;

export type AppState = TuiState & {
  oracleTx?: Tx;
}
