import * as React from 'react';
import { IGif } from '@giphy/js-types';
import { Trail, animated } from 'react-spring/renderprops';
import { getGifHeight, getGifWidth } from '@giphy/js-util';

export type MasonryCacheItem = {
  data: IGif;
  dim: {
    bottom: number;
    fullHeight: number;
    fullWidth: number;
    height: number;
    left: number;
    top: number;
    width: number;
  };
  transform: string;
};

type MasonryCacheResult = {
  containerStyles: {
    height: number;
    width: number;
  };
  gridItems: MasonryCacheItem[];
};

type MasonryCache = {
  innerWidth: number;
  result: MasonryCacheResult;
};

type Props = {
  gutter: number;
  items: IGif[];
  loadMoreItems: () => void;
  renderItem: (item: MasonryCacheItem, index: number) => React.ReactElement;
  targetWidth: number;
};

type DerivedState = {
  hasNewItems: boolean;
  itemsLength: number;
};

type State = DerivedState & {
  scrollY: number;
};

export default class MasonryGrid extends React.Component<Props, State> {
  static getDerivedStateFromProps(nextProps, prevState): DerivedState {
    const itemsLength = nextProps.items.length;
    const hasNewItems = itemsLength !== prevState.itemsLength;
    return {
      hasNewItems,
      itemsLength,
    };
  }

  state: State = {
    ...MasonryGrid.getDerivedStateFromProps(this.props, {}),
    scrollY: 0,
  };

  masonryCache?: MasonryCache = null;

  raf = null;

  handleEvent = (): void => {
    if (this.raf === null) {
      this.raf = window.requestAnimationFrame(() => {
        this.raf = null;
        this.setState({ scrollY: window.scrollY });
      });
    }
  };

  componentDidMount(): void {
    window.addEventListener('scroll', this.handleEvent);
    window.addEventListener('resize', this.handleEvent);
  }

  componentWillUnmount(): void {
    this.masonryCache = null;
    this.raf = null;
    window.removeEventListener('scroll', this.handleEvent);
    window.removeEventListener('resize', this.handleEvent);
  }

  generateLayout(): MasonryCacheResult {
    const { gutter, items, targetWidth } = this.props;
    const { hasNewItems } = this.state;
    const { innerHeight, innerWidth } = window;

    if (
      this.masonryCache &&
      !hasNewItems &&
      this.masonryCache.innerWidth === innerWidth
    ) {
      return this.masonryCache.result;
    }

    const columns = Math.floor(innerWidth / targetWidth) || 1;
    const itemWidth = Math.floor((innerWidth - gutter * columns) / columns);
    const columnSizes = Array.from(Array(columns), () => 0);

    const gridItems = items.map(
      (item): MasonryCacheItem => {
        const columnIndex = columnSizes.indexOf(Math.min(...columnSizes));

        const itemHeight = getGifHeight(item, itemWidth);

        const itemLeft = columnIndex * itemWidth + columnIndex * gutter;
        const itemTop = columnSizes[columnIndex];
        const itemBottom = itemTop + itemHeight;

        columnSizes[columnIndex] += itemHeight + gutter;

        return {
          data: item,
          dim: {
            bottom: itemBottom,
            fullHeight: innerHeight,
            fullWidth: getGifWidth(item, innerHeight),
            height: itemHeight,
            left: itemLeft,
            top: itemTop,
            width: itemWidth,
          },
          transform: `translate3d(${itemLeft}px,${itemTop}px,0)`,
        };
      },
    );

    const containerWidth = columns * itemWidth + (columns - 1) * gutter;
    const containerHeight = Math.max(...columnSizes) - gutter;
    const containerStyles = {
      height: containerHeight,
      position: 'relative',
      width: containerWidth,
    };

    const result = { containerStyles, gridItems };
    this.masonryCache = { innerWidth, result };
    return result;
  }

  isVisible(item): boolean {
    const { scrollY } = this.state;
    const { innerHeight } = window;

    return (
      scrollY - innerHeight < item.dim.bottom &&
      scrollY + innerHeight * 2 > item.dim.top
    );
  }

  shouldLoadMore(containerHeight): boolean {
    const { hasNewItems, scrollY } = this.state;
    const { innerHeight } = window;
    return (
      containerHeight > 0 &&
      containerHeight - innerHeight * 2 < scrollY &&
      !hasNewItems
    );
  }

  render(): React.ReactElement {
    const { loadMoreItems, renderItem } = this.props;
    const { containerStyles, gridItems } = this.generateLayout();

    if (this.shouldLoadMore(containerStyles.height)) {
      loadMoreItems();
    }

    return (
      <div style={containerStyles}>
        <Trail
          native
          config={{ tension: 444 }}
          items={gridItems}
          keys={(item): string | number => item.data.id}
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
        >
          {(item, index) => (style): React.ReactElement | boolean =>
            this.isVisible(item) && (
              <animated.div style={style}>
                {renderItem(item, index)}
              </animated.div>
            )}
        </Trail>
      </div>
    );
  }
}
