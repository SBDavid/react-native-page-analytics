import * as React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

export type ShowEvent = {
  hasInteracted: Boolean;
  hasViewed: Boolean;
};

export type Props = {
  onShow?: (e: ShowEvent) => void;
  onHide?: () => void;
  onRefreshed?: () => void;
  disable?: Boolean;
  debugTitle?: string;
};

export default class ScrollAnalytics extends React.PureComponent<Props> {
  // 当前节点必然处于列表中
  static contextTypes = {
    virtualizedCell: PropTypes.object,
    virtualizedList: PropTypes.object,
  };

  constructor(props: Props) {
    super(props);

    this._isInVirtuallizedList = this._isInVirtuallizedList.bind(this);
    this._isInNestedVirtuallizedList =
      this._isInNestedVirtuallizedList.bind(this);
    this._getCurrentListRef = this._getCurrentListRef.bind(this);
    this._getParentListRef = this._getParentListRef.bind(this);
    this._onScrollHandler = this._onScrollHandler.bind(this);
    this._isViewable = this._isViewable.bind(this);
    this._hasInteracted = this._hasInteracted.bind(this);
    this._hasViewed = this._hasViewed.bind(this);
    this.manuallyHide = this.manuallyHide.bind(this);
    this.manuallyShow = this.manuallyShow.bind(this);
    this.manuallyRefreshed = this.manuallyRefreshed.bind(this);
    this._getSelfMeasureLayout = this._getSelfMeasureLayout.bind(this);
    this._getOutmostListSize = this._getOutmostListSize.bind(this);
    this._getOutermostParentListRef =
      this._getOutermostParentListRef.bind(this);
  }

  // 是否处于曝光状态
  isVisable: boolean = false;

  componentDidMount() {
    if (this.props.disable) return;

    let currentList = this._getCurrentListRef();
    do {
      currentList.addScrollListener(this._onScrollHandler);
      currentList = currentList._getParentListRef();
    } while (currentList);

    // 绑定手动事件
    this._getOutermostParentListRef().addManuallyHideListener(
      this.manuallyHide
    );
    this._getOutermostParentListRef().addManuallyShowListener(
      this.manuallyShow
    );
    this._getOutermostParentListRef().addManuallyRefreshedListener(
      this.manuallyRefreshed
    );

    // 计算冷启动曝光
    setTimeout(() => {
      this._isViewable();
    }, 100);
  }

  _cancelTimeout: NodeJS.Timeout | undefined;
  _onScrollHandler() {
    if (this._cancelTimeout) clearTimeout(this._cancelTimeout);
    this._cancelTimeout = setTimeout(this._isViewable, 500);
  }

  async _isViewable() {
    // 获取最外层的容器布局信息
    const outMostSize = await this._getOutmostListSize();
    // 获取 item 的 size
    const itemSize = await this._getSelfMeasureLayout();
    // 获取所有的偏移量加总
    let offsetX = 0;
    let offsetY = 0;
    let currentList = this._getCurrentListRef();
    let currentCellIndex = this.context.virtualizedCell.cellIndex;
    let prevHorizontal: number | undefined;
    do {
      // 当前移动方向
      const isHorizontal = currentList.props.horizontal;
      // 滑动距离
      const scrollOffset = currentList._scrollMetrics.offset;
      // 距离0位置的布局偏移
      let layoutOffset = currentList._getFrameMetrics(currentCellIndex).offset;

      // 计算累计的偏移距离
      if (isHorizontal && prevHorizontal !== isHorizontal) {
        offsetX = offsetX - scrollOffset + layoutOffset;
      }
      if (!isHorizontal && prevHorizontal !== isHorizontal) {
        offsetY = offsetY - scrollOffset + layoutOffset;
      }

      // 设置下一轮循环
      if (currentList && currentList.context.virtualizedCell) {
        currentCellIndex = currentList.context.virtualizedCell.cellIndex;
      }
      currentList = currentList._getParentListRef();
      prevHorizontal = isHorizontal;
    } while (currentList);

    const top = offsetY;
    const bottom = top + itemSize.height;
    const left = offsetX;
    const right = left + itemSize.width;

    const visable =
      top <= outMostSize.height + 1 &&
      top >= 0 &&
      bottom <= outMostSize.height + 1 &&
      left <= outMostSize.width + 1 &&
      left >= 0 &&
      right <= outMostSize.width + 1;

    if (!this.isVisable && visable) {
      this.isVisable = true;
      this.props.onShow &&
        this.props.onShow({
          hasInteracted: this._hasInteracted(),
          hasViewed: this._hasViewed(),
        });
    }

    if (this.isVisable && !visable) {
      this.isVisable = false;
      this.props.onHide && this.props.onHide();
    }
  }

  // 手动隐藏接口，用户页面离开或者tab页离开
  manuallyHide() {
    this.isVisable = false;
    // 如果离开页面也作为已交互过处理
    if (!this._getCurrentListRef()._hasRefreshed) {
      this._getCurrentListRef()._hasRefreshed = true;
    }
  }

  // 手动触发展示
  manuallyShow() {
    setTimeout(this._isViewable, 100);
  }

  // 手动触发刷新
  manuallyRefreshed() {
    this.isVisable = false;
    this._getCurrentListRef()._hasViewedKeys.clear();
    if (!this._getCurrentListRef()._hasRefreshed) {
      this._getCurrentListRef()._hasRefreshed = true;
    }
    if (this.props.onRefreshed) {
      this.props.onRefreshed();
    }

    setTimeout(this._isViewable, 500);
  }

  componentWillUnmount() {
    if (this.props.disable) return;
    // 接触事件绑定
    let currentList = this._getCurrentListRef();
    do {
      currentList.removeScrollListener(this._onScrollHandler);
      currentList = currentList._getParentListRef();
    } while (currentList);

    // 手动事件
    // 绑定手动事件
    this._getOutermostParentListRef().removeManuallyHideListener(
      this.manuallyHide
    );
    this._getOutermostParentListRef().removeManuallyShowListener(
      this.manuallyShow
    );
    this._getOutermostParentListRef().removeManuallyRefreshedListener(
      this.manuallyRefreshed
    );
  }

  render() {
    return <View ref={this.itemRef}>{this.props.children}</View>;
  }

  // 是否在 VirtuallizedList 内
  _isInVirtuallizedList() {
    return (
      this.context.virtualizedList !== undefined &&
      this.context.virtualizedList.addScrollListener !== undefined
    );
  }

  // 是否是嵌套的列表
  _isInNestedVirtuallizedList() {
    return (
      this._isInVirtuallizedList() &&
      this._getCurrentListRef().context.virtualizedList !== undefined
    );
  }

  // 获取最外层List对象
  _getOutermostParentListRef() {
    let current = this.context.virtualizedList.getSelfListRef();
    while (current._getParentListRef()) {
      current = current._getParentListRef();
    }
    return current;
  }

  // 获取当前节点的列表ref
  _getCurrentListRef() {
    return this.context.virtualizedList.getSelfListRef();
  }

  // 获取父级列表节点的ref
  _getParentListRef() {
    return this.context.virtualizedList.getParentListRef();
  }

  // 获取 VirtualizedCell 的index
  _getVirtualizedCellIndex(ListRef: any, key: any) {
    let _index;
    const { data, getItemCount, getItem, keyExtractor } = ListRef.props;
    const itemCount = getItemCount(data);
    for (let index = 0; index < itemCount; index++) {
      const item = getItem(data, index);
      if (key === keyExtractor(item, index)) {
        _index = index;
        break;
      }
    }
    return _index;
  }

  // 是否发生过交互，包括滑动和刷新
  _hasInteracted() {
    let currentList = this._getCurrentListRef();
    do {
      if (currentList._hasInteracted) return true;
      currentList = currentList._getParentListRef();
    } while (currentList);
    return false;
  }

  // 是否是首次出现
  _hasViewed() {
    const key = this.context.virtualizedCell.cellKey;
    const _hasViewedKeys = this._getCurrentListRef()._hasViewedKeys;
    if (_hasViewedKeys.has(key)) {
      return true;
    } else {
      _hasViewedKeys.add(key);
      return false;
    }
  }

  // 获取最外层列表的 Size
  outmostListWidth?: number;
  outmostListHeight?: number;
  async _getOutmostListSize() {
    return new Promise<{
      width: number;
      height: number;
    }>((resolve, reject) => {
      if (
        this.outmostListWidth !== undefined &&
        this.outmostListHeight !== undefined
      ) {
        resolve({
          width: this.outmostListWidth,
          height: this.outmostListHeight,
        });
      }

      this._getOutermostParentListRef()
        .getScrollRef()
        .measureInWindow(
          (left: number, top: number, width: number, height: number) => {
            if (width !== 0 && height !== 0) {
              this.outmostListWidth = width;
              this.outmostListHeight = height;
              resolve({ width, height });
            }

            reject('获取最外层列表的 Size 失败');
          }
        );
    });
  }

  itemRef = React.createRef<View>();

  // 获取本节点相对最外层列表的 Size，offset
  async _getSelfMeasureLayout() {
    return new Promise<{
      left: number;
      top: number;
      width: number;
      height: number;
    }>((resolve, reject) => {
      this.itemRef.current?.measureLayout(
        // @ts-ignore
        this._isInNestedVirtuallizedList()
          ? this._getParentListRef().getScrollableNode()
          : this._getCurrentListRef().getScrollableNode(),
        (left, top, width, height) => {
          resolve({ left, top, width, height });
        },
        () => {
          reject('获取本节点位置失败');
        }
      );
    });
  }
}
