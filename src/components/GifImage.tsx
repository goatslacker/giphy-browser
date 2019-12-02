import React from 'react';
import { IGif } from '@giphy/js-types';
import { css } from 'emotion';
import { getBestRenditionUrl } from '@giphy/js-util';
import {
  giphyBlue,
  giphyGreen,
  giphyPurple,
  giphyRed,
  giphyYellow,
} from '@giphy/js-brand';

const GRID_COLORS = [giphyBlue, giphyGreen, giphyPurple, giphyRed, giphyYellow];

function getColor(n: number): string {
  return GRID_COLORS[Math.floor(n % GRID_COLORS.length)];
}

const WAITING = css`
  opacity: 0;
`;

const LOADED = css`
  opacity: 1;
  transition-duration: 0.4s;
  transition-property: 'opacity';
  transition-timing-function: 'ease-in';
`;

const RESET_BUTTON_STYLES = css`
  background: none;
  border: none;
  cursor: pointer;
  outline: inherit;
  padding: 0;
`;

type Props = {
  colorKey: number;
  height: number;
  gif: IGif;
  onTap: (gif: IGif) => void;
  transform: string;
  width: number;
};

type State = {
  loaded: boolean;
};

export default class GifImage extends React.PureComponent<Props, State> {
  state = { loaded: false };

  handleImageLoad = (): void => {
    this.setState({ loaded: true });
  };

  render(): React.ReactElement {
    const { colorKey, height, gif, onTap, transform, width } = this.props;
    const { loaded } = this.state;

    return (
      <div
        style={{
          backgroundColor: getColor(colorKey),
          height,
          position: 'absolute',
          transform,
          width,
        }}
      >
        <button
          type="button"
          className={RESET_BUTTON_STYLES}
          onClick={(): void => onTap(gif)}
        >
          <img
            alt={gif.title}
            className={loaded ? LOADED : WAITING}
            height={height}
            onLoad={this.handleImageLoad}
            src={getBestRenditionUrl(gif, width, height)}
          />
        </button>
      </div>
    );
  }
}
