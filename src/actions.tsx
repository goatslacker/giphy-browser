import { Action, Dispatch } from 'redux';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { IGif } from '@giphy/js-types';
import { ThunkAction } from 'redux-thunk';

import secrets from '../secrets.json';
import { GiphyReducerState } from './storeTypes';

const [API_KEY] = secrets;

const giphyFetch = new GiphyFetch(API_KEY);

export const GIFS_RECEIVED = 'GIFS_RECEIVED';
export const GIF_RECEIVED = 'GIF_RECEIVED';
export const HAS_ERROR = 'HAS_ERROR';
export const INPUT_CHANGED = 'INPUT_CHANGED';
export const IS_FETCHING = 'IS_FETCHING';

type FluxStandardAction = Action<string> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  error?: boolean;
};

function weFetchingHere(): FluxStandardAction {
  return {
    type: IS_FETCHING,
    payload: null,
  };
}

function gifReceived(gif: IGif): FluxStandardAction {
  return {
    type: GIF_RECEIVED,
    payload: gif,
  };
}

function gifsReceived(gifs: IGif[]): FluxStandardAction {
  return {
    type: GIFS_RECEIVED,
    payload: gifs,
  };
}

function hasError(err: Error): FluxStandardAction {
  return {
    type: HAS_ERROR,
    payload: err,
    error: true,
  };
}

export function inputChanged(query: string): FluxStandardAction {
  return {
    type: INPUT_CHANGED,
    payload: query,
  };
}

type AsyncAction = ThunkAction<Promise<void>, GiphyReducerState, null, null>;

export function fetchByID(id: string): AsyncAction {
  return async (dispatch: Dispatch): Promise<void> => {
    dispatch(weFetchingHere());
    try {
      const { data } = await giphyFetch.gifs([id]);
      const [gif] = data;
      dispatch(gifReceived(gif));
    } catch (err) {
      dispatch(hasError(err));
    }
  };
}

const DEFAULT_LIMIT = 45;

export function fetchMoreGIFs(limit: number = DEFAULT_LIMIT): AsyncAction {
  return async (dispatch: Dispatch, getState): Promise<void> => {
    const { isFetching, queries, query } = getState();

    const { hasReachedEnd = false, items = [] } = queries[query] || {};
    if (isFetching || hasReachedEnd) {
      return;
    }

    dispatch(weFetchingHere());

    try {
      const options = { offset: items.length, limit };
      const { data: gifs } = await (query
        ? giphyFetch.search(query, options)
        : giphyFetch.trending(options));

      dispatch(gifsReceived(gifs));
    } catch (err) {
      dispatch(hasError(err));
    }
  };
}
