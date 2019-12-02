import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore } from 'redux';

import { GiphyReducerState } from './storeTypes';
import {
  GIFS_RECEIVED,
  GIF_RECEIVED,
  HAS_ERROR,
  INPUT_CHANGED,
  IS_FETCHING,
} from './actions';

const state = {
  gifs: {},
  isError: false,
  isFetching: false,
  queries: {},
  query: '',
};

function giphyReducer(prevState = state, { type, payload }): GiphyReducerState {
  if (type === INPUT_CHANGED) {
    return {
      ...prevState,
      query: payload,
    };
  }

  if (type === IS_FETCHING) {
    return {
      ...prevState,
      isFetching: true,
    };
  }

  if (type === GIFS_RECEIVED) {
    const { queries, query } = prevState;
    const prevGifs = queries[query] ? queries[query].items : [];

    const newGifs = {};
    const gifIDs = [];
    payload.forEach((gif) => {
      newGifs[gif.id] = gif;
      gifIDs.push(gif.id);
    });

    return {
      ...prevState,
      gifs: {
        ...prevState.gifs,
        ...newGifs,
      },
      isError: false,
      isFetching: false,
      queries: {
        ...prevState.queries,
        [query]: {
          hasReachedEnd: payload.length === 0,
          items: prevGifs.concat(gifIDs),
        },
      },
    };
  }

  if (type === GIF_RECEIVED) {
    return {
      ...prevState,
      gifs: {
        ...prevState.gifs,
        [payload.id]: payload,
      },
      isError: false,
      isFetching: false,
    };
  }

  if (type === HAS_ERROR) {
    return {
      ...prevState,
      isError: true,
      isFetching: false,
    };
  }

  return prevState;
}

const store = createStore(giphyReducer, applyMiddleware(thunkMiddleware));

export default store;
