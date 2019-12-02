import React from 'react';
import { IGif } from '@giphy/js-types';
import { css } from 'emotion';
import { getBestRenditionUrl } from '@giphy/js-util';

const GIF_STYLES = css`
  display: block;
  margin: 0 auto;
`;

type Props = {
  gif: IGif;
  height: number;
  width: number;
};

function FullScreenGif({ gif, height, width }: Props): React.ReactElement {
  return (
    <img
      alt={gif.title}
      className={GIF_STYLES}
      height={height}
      src={getBestRenditionUrl(gif, width, height)}
      width={width}
    />
  );
}

export default FullScreenGif;
