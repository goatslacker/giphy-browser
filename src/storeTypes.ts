import { IGif } from '@giphy/js-types';

export type GIFID = string | number;

export type Query = {
  hasReachedEnd: boolean;
  items: GIFID[];
};

export type GiphyReducerState = {
  gifs: Record<string, IGif>;
  isError: boolean;
  isFetching: boolean;
  queries: Record<string, Query>;
  query: string;
};
