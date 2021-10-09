import * as React from 'react';
import { View, InteractionManager } from 'react-native';
import EventEmitter from 'eventemitter3';
import PropTypes from 'prop-types';
import ScrollAnalyticStoreWrapper from './ScrollAnalyticStoreWrapper';
import type { UseNaviType } from './ScrollAnalyticStoreWrapper';

type Props = {
  buildChildren: (
    triggerScroll: () => void,
    triggerRefreshed: () => void
  ) => JSX.Element;
  useNavigation?: UseNaviType;
};

export default class ScrollAnalyticWapper extends React.PureComponent<Props> {
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
      <ScrollAnalyticStoreWrapper useNavigation={this.props.useNavigation}>
        <View
          ref={this.ref}
          onLayout={() => {
            InteractionManager.runAfterInteractions(() => {
              this._sizeResolve && this._sizeResolve(null);
            });
          }}
        >
          {this.props.buildChildren(this.triggerScroll, this.triggerRefreshed)}
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
}
