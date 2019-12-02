import { IGif } from '@giphy/js-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { debounce } from 'throttle-debounce';

import GiphySearch, {
  MapStateToProps,
  MapDispatchToProps,
} from '../components/GiphySearch';
import { fetchMoreGIFs, inputChanged } from '../actions';
import { GIFID, Query } from '../storeTypes';

type GIFS = Record<string, IGif>;

function getSearchQuery({ queries, query }): Query {
  return queries[query] || {};
}

function getGIFIDs(state): GIFID[] {
  const search = getSearchQuery(state);
  return search.items || [];
}

function getGIFs(state): GIFS {
  return state.gifs;
}

const getItems = createSelector([getGIFIDs, getGIFs], (gifIDs, gifs) =>
  gifIDs.map((id) => gifs[id]),
);

function mapStateToProps(state): MapStateToProps {
  const { isError, query } = state;
  const { hasReachedEnd = false } = getSearchQuery(state);
  const gifIDs = getGIFIDs(state);
  const showLoader = gifIDs.length > 0 && !hasReachedEnd;
  const items = getItems(state);

  return {
    isError,
    items,
    showLoader,
    query,
  };
}

const FETCH_DEBOUNCE_TIME = 300;

function mapDispatchToProps(dispatch): MapDispatchToProps {
  const fetchGifs = debounce(FETCH_DEBOUNCE_TIME, () =>
    dispatch(fetchMoreGIFs()),
  );

  return {
    fetchGifs,
    inputChanged: (query): void => dispatch(inputChanged(query)),
  };
}

const GiphySearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GiphySearch);

export default GiphySearchContainer;
