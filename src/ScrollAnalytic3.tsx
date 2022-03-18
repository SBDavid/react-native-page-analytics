import * as React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  InteractionManager,
  Platform,
  NativeModules,
  findNodeHandle,
} from 'react-native';

const packageName = 'VisibilityTracker';
const VisibilityTrackerModule = NativeModules[packageName] || {};

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
  isNormalVirtualizedList?: boolean;
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

    hasNavigation: PropTypes.func,
    isNavigationFocused: PropTypes.func,

    isNormalVirtualizedList: PropTypes.bool,
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
    this.manuallyIsVisable = this.manuallyIsVisable.bind(this);

    this._isViewableOnAndroid = this._isViewableOnAndroid.bind(this);
  }

  // 是否处于曝光状态
  isVisable: boolean = false;

  _cancelTimeout0: NodeJS.Timeout | undefined;
  componentDidMount() {
    if (this.props.disable) return;
    if (this.context.addScrollListener === undefined) return;

    // 绑定事件
    this.context.addScrollListener(this._onScrollHandler);
    this.context.addHideListener(this.manuallyHide);
    this.context.addShowListener(this.manuallyShow);
    this.context.addRefreshedListener(this.manuallyRefreshed);
    // 计算冷启动曝光
    this._cancelTimeout0 = setTimeout(async () => {
      await this.layoutPromise;
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

  // 处理Android上的离屏优化，ios上返回可见
  async _isViewableOnAndroid(selfSize: any, wrapperSize: any) {
    if (Platform.OS === 'android') {
      return new Promise((resolve) => {
        if (VisibilityTrackerModule.isViewVisible !== undefined) {
          VisibilityTrackerModule.isViewVisible(
            findNodeHandle(this.itemRef.current),
            (e: any) => {
              // console.info('_isViewableOnAndroid new', e, this.props._key);
              resolve(e);
            },
            () => {
              resolve(true);
            }
          );
        } else {
          const res =
            selfSize.left === 0 &&
            selfSize.top === wrapperSize.top &&
            Platform.OS === 'android';
          // console.info('_isViewableOnAndroid old', !res, this.props._key);
          resolve(!res);
        }
      });
    } else {
      throw Error('IOS系统上没有 _isViewableOnAndroid 接口');
    }
  }

  async _isViewable() {
    // console.info('_isViewable start', this.props._key);
    try {
      if (
        this.context.isDisablePageAnalytics !== undefined &&
        this.context.isDisablePageAnalytics()
      ) {
        console.info('_isViewable end 1', this.props._key);
        return;
      }

      if (this.context.hasNavigation() && !this.context.isNavigationFocused()) {
        // console.info('_isViewable end 2', this.props._key);
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

      // console.info('_isViewable size', this.props._key, res, selfSize, wrapperSize);

      if (res && !this.isVisable) {
        // 如果Android上离屏，则不发送可见
        if (Platform.OS === 'android') {
          if (!(await this._isViewableOnAndroid(selfSize, wrapperSize))) {
            return;
          }
        }

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

    if (selfScrollMetrics === undefined) {
      return false;
    }

    const selfIndex = this._getVirtualizedCellIndex(
      selfRef,
      this.context.virtualizedCell.cellKey
    );

    // 相对位置
    const seflFrameMetrics = selfRef._getFrameMetrics(selfIndex);

    if (
      seflFrameMetrics === undefined ||
      selfScrollMetrics.contentLength === 0
    ) {
      return 0;
    }

    return this._computeIsViewable(selfScrollMetrics, seflFrameMetrics);
  }

  // 手动查询是否为可见状态
  async manuallyIsVisable() {
    // console.info('manuallyIsVisable', this.props._key);
    if (this.context.hasNavigation() && !this.context.isNavigationFocused()) {
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

    if (res && Platform.OS === 'android') {
      if (!(await this._isViewableOnAndroid(selfSize, wrapperSize))) {
        return {
          isVisable: false,
          hasInteracted: this.context.getHasInteracted(),
          hasViewed: this._hasViewed(),
        };
      }
    }

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
    // console.info('manuallyHide', this.props._key);
    this.isVisable = false;
    // 如果离开页面也作为已交互过处理
    if (!this.context.setHasInteracted) {
      return;
    }
    this.context.setHasInteracted(true);
  }

  // 手动触发展示
  manuallyShow() {
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        // console.info('manuallyShow', this.props._key);
        this._isViewable();
      });
    }, 1000);
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

    if (this._cancelTimeout) clearTimeout(this._cancelTimeout);
    if (this._cancelTimeout0) clearTimeout(this._cancelTimeout0);

    // 绑定事件
    this.context.removeScrollListener(this._onScrollHandler);
    this.context.removeHideListener(this.manuallyHide);
    this.context.removeShowListener(this.manuallyShow);
    this.context.removeRefreshedListener(this.manuallyRefreshed);
  }

  render() {
    return (
      <View
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
