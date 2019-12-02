import React from 'react';
import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import { Provider } from 'react-redux';

import GiphySearchContainer from './containers/GiphySearchContainer';
import store from './store';

const App = (
  <Provider store={store}>
    <GiphySearchContainer />
  </Provider>
);

ReactDOM.render(App, document.getElementById('root'));
ReactModal.setAppElement('#root');
