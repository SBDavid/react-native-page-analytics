import * as React from 'react';
import { View, InteractionManager, StyleProp, ViewStyle } from 'react-native';
import EventEmitter from 'eventemitter3';
import PropTypes from 'prop-types';
import ScrollAnalyticStoreWrapper from './ScrollAnalyticStoreWrapper';
import Sender from './ScrollEventSender';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

type Props = {
  id: String;
  viewStyle?: StyleProp<ViewStyle>;
  isNormalVirtualizedList?: Boolean;
  navigation?: NavigationProp<ParamListBase>;
};

export class ScrollAnalyticWapper extends React.PureComponent<Props> {
  // 是否交互过
  hasInteracted = false;
  getHasInteracted() {
    return this.hasInteracted;
  }
  setHasInteracted(has: boolean) {
    if (this.hasInteracted !== has) {
      this.hasInteracted = has;
    }
  }
  // 是否曾经出现过
  hasViewedKeys = new Set<any>();
  emitter = new EventEmitter();

  ref = React.createRef<View>();

  // size
  height: number | undefined;
  weight: number | undefined;
  top: number | undefined;
  left: number | undefined;
  _sizeResolve: undefined | ((value: unknown) => void);
  _sizePromise = new Promise((resolve) => {
    this._sizeResolve = resolve;
  });

  // 往下传递的上下文
  static childContextTypes = {
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

    triggerScroll: PropTypes.func,
    triggerRefreshed: PropTypes.func,

    hasNavigation: PropTypes.func,
    isNavigationFocused: PropTypes.func,

    isNormalVirtualizedList: PropTypes.bool,
  };

  getChildContext() {
    return {
      getHasInteracted: this.getHasInteracted,
      setHasInteracted: this.setHasInteracted,
      hasViewedKeys: this.hasViewedKeys,
      getWrapperSize: this.getWrapperSize,
      getWrapperRef: this.getWrapperRef,

      addScrollListener: this.addScrollListener,
      removeScrollListener: this.removeScrollListener,

      addRefreshedListener: this.addRefreshedListener,
      removeRefreshedListener: this.removeRefreshedListener,

      addHideListener: this.addHideListener,
      removeHideListener: this.removeHideListener,

      addShowListener: this.addShowListener,
      removeShowListener: this.removeShowListener,

      triggerScroll: this.triggerScroll,
      triggerRefreshed: this.triggerRefreshed,

      hasNavigation: this.hasNavigation,
      isNavigationFocused: this.isNavigationFocused,

      isNormalVirtualizedList:
        this.props.isNormalVirtualizedList === undefined ||
        this.props.isNormalVirtualizedList === true,
    };
  }

  constructor(props: any) {
    super(props);

    this.getWrapperSize = this.getWrapperSize.bind(this);
    this.getWrapperRef = this.getWrapperRef.bind(this);
    this.getHasInteracted = this.getHasInteracted.bind(this);
    this.setHasInteracted = this.setHasInteracted.bind(this);

    this.triggerScroll = this.triggerScroll.bind(this);
    this.addScrollListener = this.addScrollListener.bind(this);
    this.removeScrollListener = this.removeScrollListener.bind(this);

    this.triggerRefreshed = this.triggerRefreshed.bind(this);
    this.addRefreshedListener = this.addRefreshedListener.bind(this);
    this.removeRefreshedListener = this.removeRefreshedListener.bind(this);

    this.triggerHide = this.triggerHide.bind(this);
    this.addHideListener = this.addHideListener.bind(this);
    this.removeHideListener = this.removeHideListener.bind(this);

    this.triggerShow = this.triggerShow.bind(this);
    this.addShowListener = this.addShowListener.bind(this);
    this.removeShowListener = this.removeShowListener.bind(this);

    this.globalEventHandler = this.globalEventHandler.bind(this);

    this.hasNavigation = this.hasNavigation.bind(this);
    this.isNavigationFocused = this.isNavigationFocused.bind(this);
  }

  componentDidMount() {
    Sender.addListener(this.globalEventHandler);
  }

  componentWillUnmount() {
    Sender.removeListener(this.globalEventHandler);
  }

  triggerScroll() {
    if (!this.hasInteracted) this.hasInteracted = true;
    this.emitter.emit('scroll');
  }
  addScrollListener(handler: () => void) {
    this.emitter.addListener('scroll', handler);
  }
  removeScrollListener(handler: () => void) {
    this.emitter.removeListener('scroll', handler);
  }

  globalEventHandler(event: {
    id: String;
    name: 'scroll' | 'refreshed' | 'hide' | 'show';
  }) {
    if (event.id === this.props.id) {
      if (event.name === 'scroll') {
        this.triggerScroll();
      }

      if (event.name === 'refreshed') {
        this.triggerRefreshed();
      }

      if (event.name === 'hide') {
        this.triggerHide();
      }

      if (event.name === 'show') {
        this.triggerShow();
      }
    }
  }

  triggerRefreshed() {
    if (!this.hasInteracted) this.hasInteracted = true;
    this.hasViewedKeys.clear();
    this.emitter.emit('Refreshed');
  }
  addRefreshedListener(handler: () => void) {
    this.emitter.addListener('Refreshed', handler);
  }
  removeRefreshedListener(handler: () => void) {
    this.emitter.removeListener('Refreshed', handler);
  }

  triggerHide() {
    if (!this.hasInteracted) this.hasInteracted = true;
    this.emitter.emit('Hide');
  }
  addHideListener(handler: () => void) {
    this.emitter.addListener('Hide', handler);
  }
  removeHideListener(handler: () => void) {
    this.emitter.removeListener('Hide', handler);
  }

  triggerShow() {
    this.emitter.emit('Show');
  }
  addShowListener(handler: () => void) {
    this.emitter.addListener('Show', handler);
  }
  removeShowListener(handler: () => void) {
    this.emitter.removeListener('Show', handler);
  }

  render() {
    return (
      <ScrollAnalyticStoreWrapper navigation={this.props.navigation}>
        <View
          style={
            this.props.viewStyle === undefined
              ? {}
              : (this.props.viewStyle as StyleProp<ViewStyle>)
          }
          ref={this.ref}
          onLayout={() => {
            InteractionManager.runAfterInteractions(() => {
              this._sizeResolve && this._sizeResolve(null);
            });
          }}
        >
          {this.props.children}
        </View>
      </ScrollAnalyticStoreWrapper>
    );
  }

  // 获取 size
  async getWrapperSize() {
    await this._sizePromise;
    return new Promise((resolve) => {
      this.ref.current?.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          this.top = y;
          this.left = x;
          this.height = height;
          this.weight = width;

          resolve({
            width: this.weight,
            height: this.height,
            left: this.left,
            top: this.top,
          });
        }
      );
    });
  }

  async getWrapperRef() {
    await this._sizePromise;
    return this.ref;
  }

  // 判断当前是否处于路由focus状态
  hasNavigation() {
    return this.props.navigation !== undefined;
  }
  isNavigationFocused() {
    return this.props.navigation?.isFocused();
  }
}

export type UseNaviType = <T extends NavigationProp<ParamListBase>>() => T;
function ScrollAnalyticWapperWithNavitaion(props: {
  useNavigation?: UseNaviType;
  id: String;
  isNormalVirtualizedList?: Boolean;
  viewStyle?: StyleProp<ViewStyle>;
  // buildChildren: (
  //   triggerScroll: () => void,
  //   triggerRefreshed: () => void
  // ) => JSX.Element;
  children: React.ReactNode;
}) {
  let navigation;
  if (props.useNavigation) {
    try {
      navigation = props.useNavigation();
    } catch (e) {}
  }
  if (navigation) {
    return <ScrollAnalyticWapper navigation={navigation} {...props} />;
  } else {
    return <ScrollAnalyticWapper {...props} />;
  }
}

export default ScrollAnalyticWapperWithNavitaion;
