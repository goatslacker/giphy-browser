import FetchError from '@giphy/react-components/dist/components/fetch-error';
import Loader from '@giphy/react-components/dist/components/loader';
import React from 'react';
import ReactModal from 'react-modal';
import { IGif } from '@giphy/js-types';
import { Transition, animated } from 'react-spring/renderprops';
import { createBrowserHistory } from 'history';
import { css } from 'emotion';
import {
  fontFamily,
  fontSize,
  giphyBlack,
  giphyCharcoal,
} from '@giphy/js-brand';

import FullScreenGif from './FullScreenGif';
import GifImage from './GifImage';
import MasonryGrid, { MasonryCacheItem } from './MasonryGrid';

const WRAPPER_CONTAINER = css`
  background-color: ${giphyBlack};
  min-height: '100vh';
`;

const INPUT_STYLES = css`
  color: ${giphyCharcoal};
  font-family: ${fontFamily.title};
  font-size: ${fontSize.titleLarge};
  height: 50px;
  line-height: ${fontSize.titleLarge};
  margin-bottom: 16px;
  width: 100%;
`;

export type MapStateToProps = {
  isError: boolean;
  items: IGif[];
  showLoader: boolean;
  query: string;
};

export type MapDispatchToProps = {
  fetchGifs: () => void;
  inputChanged: (query: string) => void;
};

type Props = MapStateToProps & MapDispatchToProps;

type State = {
  selectedGif?: MasonryCacheItem;
};

class GiphySearch extends React.Component<Props, State> {
  state = {
    selectedGif: null,
  };

  history = createBrowserHistory();

  unlistenHistory = null;

  componentDidMount(): void {
    const { fetchGifs } = this.props;
    fetchGifs();

    this.unlistenHistory = this.history.listen((location) => {
      const selectedGif = location.state ? location.state.gif : null;
      this.setState({ selectedGif });
    });
  }

  componentWillUnmount(): void {
    if (this.unlistenHistory) {
      this.unlistenHistory();
    }
  }

  render(): React.ReactElement {
    const { fetchGifs, inputChanged, isError, items, showLoader } = this.props;

    const { selectedGif } = this.state;

    return (
      <div className={WRAPPER_CONTAINER}>
        <input
          className={INPUT_STYLES}
          placeholder="Search GIPHY"
          onKeyUp={(e): void => {
            inputChanged((e.target as HTMLInputElement).value);
            fetchGifs();
          }}
          type="text"
        />
        <MasonryGrid
          gutter={4}
          items={items}
          loadMoreItems={(): void => fetchGifs()}
          renderItem={(gif, index): React.ReactElement => (
            <GifImage
              colorKey={index}
              gif={gif.data}
              height={gif.dim.height}
              onTap={(): void => this.history.push(gif.data.id, { gif })}
              transform={gif.transform}
              key={gif.data.id}
              width={gif.dim.width}
            />
          )}
          targetWidth={200}
        />
        {isError ? (
          <FetchError onClick={(): void => fetchGifs()} />
        ) : (
          showLoader && <Loader />
        )}
        <ReactModal
          isOpen={!!selectedGif}
          onRequestClose={(): void => this.history.goBack()}
          style={{
            content: {
              border: 'none',
              bottom: 'auto',
              left: '50%',
              position: 'fixed',
              right: 'auto',
              top: '50%',
              transform: 'translate(-50%,-50%)',
            },
          }}
        >
          <Transition
            enter={{ opacity: 1 }}
            from={{ opacity: 0 }}
            items={selectedGif}
            leave={{ opacity: 0 }}
            native
          >
            {(gif) => (style): React.ReactElement | boolean =>
              gif && (
                <animated.div style={style}>
                  <FullScreenGif
                    gif={gif.data}
                    height={gif.dim.fullHeight}
                    width={gif.dim.fullWidth}
                  />
                </animated.div>
              )}
          </Transition>
        </ReactModal>
      </div>
    );
  }
}

export default GiphySearch;
