import * as React from 'react';
import PropTypes from 'prop-types';
import { View, InteractionManager, Platform } from 'react-native';

export type ShowEvent = {
  hasInteracted: Boolean;
  hasViewed: Boolean;
};

export type Props = {
  _key: React.Key;
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

    getHasInteracted: PropTypes.func,
    setHasInteracted: PropTypes.func,
    hasViewedKeys: PropTypes.object,
    getWrapperSize: PropTypes.func,
    getWrapperRef: PropTypes.func,

    addScrollListener: PropTypes.func,
    removeScrollListener: PropTypes.func,

    addRefreshedListener: PropTypes.func,
    removeRefreshedListener: PropTypes.func,

    addHideListener: PropTypes.func,
    removeHideListener: PropTypes.func,

    addShowListener: PropTypes.func,
    removeShowListener: PropTypes.func,

    isDisablePageAnalytics: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);

    this._onScrollHandler = this._onScrollHandler.bind(this);
    this._isViewable = this._isViewable.bind(this);
    this._hasViewed = this._hasViewed.bind(this);
    this.manuallyHide = this.manuallyHide.bind(this);
    this.manuallyShow = this.manuallyShow.bind(this);
    this.manuallyRefreshed = this.manuallyRefreshed.bind(this);
    this._getSelfMeasureLayout = this._getSelfMeasureLayout.bind(this);

    this._isInVirtuallizedList = this._isInVirtuallizedList.bind(this);
    this._getCurrentListRef = this._getCurrentListRef.bind(this);
    this._computeIsViewable = this._computeIsViewable.bind(this);
    this._isVisableInAsVirtualizedList =
      this._isVisableInAsVirtualizedList.bind(this);
  }

  // 是否处于曝光状态
  isVisable: boolean = false;

  componentDidMount() {
    if (this.props.disable) return;
    if (this.context.addScrollListener === undefined) return;

    // 绑定事件
    this.context.addScrollListener(this._onScrollHandler);
    this.context.addHideListener(this.manuallyHide);
    this.context.addShowListener(this.manuallyShow);
    this.context.addRefreshedListener(this.manuallyRefreshed);
    // 计算冷启动曝光
    setTimeout(async () => {
      this._isViewable();
    }, 100);
  }

  _cancelTimeout: NodeJS.Timeout | undefined;
  _onScrollHandler() {
    if (this._cancelTimeout) clearTimeout(this._cancelTimeout);
    this._cancelTimeout = setTimeout(this._isViewable, 500);
  }

  layoutPromiseResolve: (() => void) | undefined;
  layoutPromise = new Promise<void>((resolve) => {
    this.layoutPromiseResolve = resolve;
  });
  async _isViewable() {
    try {
      if (
        this.context.isDisablePageAnalytics !== undefined &&
        this.context.isDisablePageAnalytics()
      ) {
        return;
      }

      if (!this._isVisableInAsVirtualizedList()) {
        if (this.isVisable) {
          this.isVisable = false;
          this.props.onHide && this.props.onHide();
        }
        return;
      }

      // size
      const selfSize = await this._getSelfMeasureLayout();
      const wrapperSize = await this.context.getWrapperSize();

      // 判断是否漏出
      const res =
        selfSize.left + 1 >= wrapperSize.left &&
        selfSize.left + selfSize.width <=
          wrapperSize.left + wrapperSize.width + 1 &&
        selfSize.top + 1 >= wrapperSize.top &&
        selfSize.top + selfSize.height <=
          wrapperSize.top + wrapperSize.height + 1;

      // console.info(this.props.debugTitle, res, selfSize, wrapperSize);

      if (res && !this.isVisable) {
        this.isVisable = true;
        this.props.onShow &&
          this.props.onShow({
            hasInteracted: this.context.getHasInteracted(),
            hasViewed: this._hasViewed(),
          });
        this.context.hasViewedKeys.add(this.props._key);
      }

      if (!res && this.isVisable) {
        this.isVisable = false;
        this.props.onHide && this.props.onHide();
      }
    } catch (err) {
      console.error(err);
    }
  }

  _isVisableInAsVirtualizedList() {
    if (!this._isInVirtuallizedList() || Platform.OS === 'ios') {
      return true;
    }

    const selfRef = this._getCurrentListRef();
    const selfScrollMetrics = selfRef._scrollMetrics;
    const selfIndex = this._getVirtualizedCellIndex(
      selfRef,
      this.context.virtualizedCell.cellKey
    );

    // 相对位置
    const seflFrameMetrics = selfRef._getFrameMetrics(selfIndex);

    return this._computeIsViewable(selfScrollMetrics, seflFrameMetrics);
  }

  // 手动查询是否为可见状态
  async manuallyIsVisable() {
    if (!this._isVisableInAsVirtualizedList()) {
      return {
        isVisable: false,
        hasInteracted: this.context.getHasInteracted(),
        hasViewed: this._hasViewed(),
      };
    }

    // size
    const selfSize = await this._getSelfMeasureLayout();
    const wrapperSize = await this.context.getWrapperSize();

    // 判断是否漏出
    const res =
      selfSize.left + 1 >= wrapperSize.left &&
      selfSize.left + selfSize.width <=
        wrapperSize.left + wrapperSize.width + 1 &&
      selfSize.top + 1 >= wrapperSize.top &&
      selfSize.top + selfSize.height <=
        wrapperSize.top + wrapperSize.height + 1;

    const manuallyRes = {
      isVisable: res,
      hasInteracted: this.context.getHasInteracted(),
      hasViewed: this._hasViewed(),
    };

    if (res) {
      this.isVisable = true;
      this.context.hasViewedKeys.add(this.props._key);
    }

    return manuallyRes;
  }

  // 手动隐藏接口，用户页面离开或者tab页离开
  manuallyHide() {
    this.isVisable = false;
    // 如果离开页面也作为已交互过处理
    this.context.setHasInteracted(true);
  }

  // 手动触发展示
  manuallyShow() {
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        this._isViewable();
      });
    }, 100);
  }

  // 手动触发刷新
  manuallyRefreshed() {
    this.isVisable = false;
    if (this.props.onRefreshed) {
      this.props.onRefreshed();
    }

    setTimeout(this._isViewable, 500);
  }

  componentWillUnmount() {
    if (this.props.disable) return;
    if (this.context.addScrollListener === undefined) return;

    // 绑定事件
    this.context.removeScrollListener(this._onScrollHandler);
    this.context.removeHideListener(this.manuallyHide);
    this.context.removeShowListener(this.manuallyShow);
    this.context.removeRefreshedListener(this.manuallyRefreshed);
  }

  render() {
    return (
      <View
        style={{ flex: 1 }}
        ref={this.itemRef}
        collapsable={false}
        onLayout={() => {
          InteractionManager.runAfterInteractions(() => {
            this.layoutPromiseResolve && this.layoutPromiseResolve();
          });
        }}
      >
        {this.props.children}
      </View>
    );
  }

  // 是否是首次出现
  _hasViewed() {
    if (this.context.hasViewedKeys.has(this.props._key)) {
      return true;
    }
    return false;
  }

  itemRef = React.createRef<View>();

  // 获取本节点相对最外层列表的 Size，offset
  async _getSelfMeasureLayout() {
    return new Promise<{
      left: number;
      top: number;
      width: number;
      height: number;
    }>(async (resolve) => {
      await this.layoutPromise;
      this.itemRef.current?.measureInWindow(
        // findNodeHandle((await this.context.getWrapperRef()).current) as number,
        (left: number, top: number, width: number, height: number) => {
          resolve({ left, top, width, height });
        }
      );
    });
  }

  _computeIsViewable(scrollMetrics: any, frameMetrics: any) {
    if (frameMetrics === undefined) {
      return false;
    }

    const viewPortTop = scrollMetrics.offset;
    const viewPortBottom = viewPortTop + scrollMetrics.visibleLength;
    const itemTop = frameMetrics.offset;
    const itemBottom = itemTop + frameMetrics.length;
    return viewPortTop - 1 <= itemTop && viewPortBottom + 1 >= itemBottom;
  }

  // 是否在 VirtuallizedList 内
  _isInVirtuallizedList() {
    return this.context.virtualizedList !== undefined;
  }

  // 获取当前节点的列表ref
  _getCurrentListRef() {
    return this.context.virtualizedList.getOutermostParentListRef();
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
}
