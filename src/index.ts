import { configureStore } from '@reduxjs/toolkit';
import { AppState, config, reducer } from './state';
import { View } from './redux-tui/view/View';


/////////////////////////////////////////////////////////////////////////////////////////
// Store Configuration

const store = configureStore<AppState>({
  reducer,
});

const view = new View(config, store);

store.subscribe(view.render);

view.render();
