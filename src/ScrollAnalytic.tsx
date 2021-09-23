import * as React from 'react';
import PropTypes from 'prop-types';

export type ShowEvent = {
  hasInteracted: Boolean;
  hasViewed: Boolean;
};

export type Props = {
  onShow?: (e: ShowEvent) => void;
  onHide?: () => void;
  onRefreshed?: () => void;
  disable?: Boolean;
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
    this._computeIsViewable = this._computeIsViewable.bind(this);
    this._hasInteracted = this._hasInteracted.bind(this);
    this._hasViewed = this._hasViewed.bind(this);
    this.manuallyHide = this.manuallyHide.bind(this);
    this.manuallyShow = this.manuallyShow.bind(this);
    this.manuallyRefreshed = this.manuallyRefreshed.bind(this);
  }

  // 是否处于曝光状态
  isVisable: boolean = false;

  componentDidMount() {
    if (this.props.disable) return;
    // 如果处于列表内部，则绑定事件
    if (this._isInVirtuallizedList()) {
      this._getCurrentListRef().addScrollListener(this._onScrollHandler);

      // 绑定父级的滚动事件
      if (this._isInNestedVirtuallizedList()) {
        this._getParentListRef().addScrollListener(this._onScrollHandler);
      }
    }

    // 绑定手动事件
    if (this._isInNestedVirtuallizedList()) {
      this._getParentListRef().addManuallyHideListener(this.manuallyHide);
      this._getParentListRef().addManuallyShowListener(this.manuallyShow);
      this._getParentListRef().addManuallyRefreshedListener(
        this.manuallyRefreshed
      );
    } else {
      this._getCurrentListRef().addManuallyHideListener(this.manuallyHide);
      this._getCurrentListRef().addManuallyShowListener(this.manuallyShow);
      this._getCurrentListRef().addManuallyRefreshedListener(
        this.manuallyRefreshed
      );
    }

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

  _isViewable() {
    // 如果有父级列表
    if (this._isInNestedVirtuallizedList()) {
      const parentRef = this._getParentListRef();
      // 父级的布局信息
      const scrollMetrics = parentRef._scrollMetrics;

      const parentKey = this._getCurrentListRef()._getCellKey();
      const parentIndex = this._getVirtualizedCellIndex(parentRef, parentKey);
      // 父级的相对位置
      const frameMetrics = parentRef._getFrameMetrics(parentIndex);

      // 父级是否曝光
      if (this._computeIsViewable(scrollMetrics, frameMetrics)) {
        if (!this.isVisable) {
          // console.info('父级 曝光');
        }
      } else {
        if (this.isVisable) {
          // console.info('父级 隐藏');
          this.isVisable = false;
          this.props.onHide && this.props.onHide();
        }
        return;
      }
    }

    // 自身是否曝光
    const selfRef = this._getCurrentListRef();
    const selfScrollMetrics = selfRef._scrollMetrics;
    const selfIndex = this._getVirtualizedCellIndex(
      selfRef,
      this.context.virtualizedCell.cellKey
    );

    // 相对位置
    const seflFrameMetrics = selfRef._getFrameMetrics(selfIndex);
    // 是否曝光
    if (!this._computeIsViewable(selfScrollMetrics, seflFrameMetrics)) {
      if (this.isVisable) {
        // console.info('子级 隐藏');
        this.isVisable = false;
        this.props.onHide && this.props.onHide();
      }
      return;
    }
    if (!this.isVisable) {
      // console.info('子级 曝光');
      this.isVisable = true;

      this.props.onShow &&
        this.props.onShow({
          hasInteracted: this._hasInteracted(),
          hasViewed: this._hasViewed(),
        });
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

  _computeIsViewable(scrollMetrics: any, frameMetrics: any) {
    const viewPortTop = scrollMetrics.offset;
    const viewPortBottom = viewPortTop + scrollMetrics.visibleLength;
    const itemTop = frameMetrics.offset;
    const itemBottom = itemTop + frameMetrics.length;
    return viewPortTop - 1 <= itemTop && viewPortBottom + 1 >= itemBottom;
  }

  componentWillUnmount() {
    if (this.props.disable) return;
    // 接触事件绑定
    if (this._isInVirtuallizedList()) {
      this._getCurrentListRef().removeScrollListener(this._onScrollHandler);

      // 绑定父级的滚动事件
      if (this._isInNestedVirtuallizedList()) {
        this._getParentListRef().removeScrollListener(this._onScrollHandler);
      }
    }

    // 手动事件
    if (this._isInNestedVirtuallizedList()) {
      this._getParentListRef().removeManuallyHideListener(this.manuallyHide);
      this._getParentListRef().removeManuallyShowListener(this.manuallyShow);
      this._getParentListRef().removeManuallyRefreshedListener(
        this.manuallyRefreshed
      );
    } else {
      this._getCurrentListRef().removeManuallyHideListener(this.manuallyHide);
      this._getCurrentListRef().removeManuallyShowListener(this.manuallyShow);
      this._getCurrentListRef().removeManuallyRefreshedListener(
        this.manuallyRefreshed
      );
    }
  }

  render() {
    return this.props.children;
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

  // 获取当前节点的列表ref
  _getCurrentListRef() {
    return this.context.virtualizedList.getOutermostParentListRef();
  }

  // 获取父级列表节点的ref
  _getParentListRef() {
    return this._getCurrentListRef().context.virtualizedList.getOutermostParentListRef();
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
    if (!this._isInNestedVirtuallizedList())
      return (
        this._getCurrentListRef()._hasInteracted ||
        this._getCurrentListRef()._hasRefreshed
      );
    return (
      this._getCurrentListRef()._hasInteracted ||
      this._getCurrentListRef()._hasRefreshed ||
      this._getParentListRef()._hasInteracted ||
      this._getParentListRef()._hasRefreshed
    );
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

  // 作废
  // 获取最外层列表的 Size
  // async _getOutmostListSize() {
  //   return new Promise<void>((resolve, reject) => {
  //     if (
  //       this.outmostListWidth !== undefined &&
  //       this.outmostListHeight !== undefined
  //     ) {
  //       resolve();
  //     }

  //     this._getParentListRef()
  //       .getScrollRef()
  //       .measureInWindow((left, top, width, height) => {
  //         if (width !== 0 && height !== 0) {
  //           this.outmostListWidth = width;
  //           this.outmostListHeight = height;
  //           console.info('父级 measureLayout', left, top, width, height);
  //           resolve();
  //         }

  //         reject('获取最外层列表的 Size 失败');
  //       });
  //   });
  // }

  // 作废
  // 获取本节点相对最外层列表的 Size，offset
  // async _getSelfMeasureLayout() {
  //   return new Promise<Measure>((resolve, reject) => {
  //     this.itemRef.current.measureLayout(
  //       // @ts-ignore
  //       this._isInNestedVirtuallizedList()
  //         ? this._getParentListRef().getScrollableNode()
  //         : this._getCurrentListRef().getScrollableNode(),
  //       (left, top, width, height) => {
  //         console.info('获取本节点位置', left, top, width, height);
  //         resolve({ left, top, width, height });
  //       },
  //       () => {
  //         reject('获取本节点位置失败');
  //       }
  //     );
  //   });
  // }
}
