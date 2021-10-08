import React from 'react';
import { AppStateStatus, AppState } from 'react-native';
import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import PropTypes from 'prop-types';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import {
  CustomAppState,
  CustomNavigationState,
  CustomPageState,
  isIos,
  PageEventEmitter,
  PageViewExitEventSource,
} from './Screen';
import { ExposeType } from './ScrollAnalyticComp';

export type CustomProps = {
  navigation?: NavigationProp<ParamListBase>;
  [index: string]: any;
};

export enum CustomScrollAnalyticEvent {
  onFocus = 'onFocus',
  onBlur = 'onBlur',
}

export const GlobalEventEmitter =
  Platform.OS === 'ios' ? DeviceEventEmitter : new NativeEventEmitter();

const AndroidGlobalEventEmitter = new NativeEventEmitter(NativeModules.Page);
const isAndroid = Platform.OS === 'android';

class ScrollAnalyticStore<P, S> extends React.Component<P & CustomProps, S> {
  //
  static childContextTypes = {
    updateItemHasExposedType: PropTypes.func,
    shouldItemExposeScroll: PropTypes.func,
  };

  //
  getChildContext() {
    return {
      updateItemHasExposedType: this.updateItemHasExposedType,
      shouldItemExposeScroll: this.shouldItemExposeScroll,
    };
  }

  public itemLifeCycleHasExposedTypeMap: Map<React.Key, ExposeType> = new Map();

  //
  public updateItemHasExposedType = (
    itemKey: React.Key,
    exposeType: ExposeType
  ) => {
    this.itemLifeCycleHasExposedTypeMap.set(itemKey, exposeType);
  };

  //
  public shouldItemExposeScroll = (itemKey: React.Key): boolean => {
    const itemLifeCycleHasExposedType =
      this.itemLifeCycleHasExposedTypeMap.get(itemKey);
    return itemLifeCycleHasExposedType === undefined;
  };

  //
  private refreshLifeCycle = () => {
    this.itemLifeCycleHasExposedTypeMap.clear();
  };

  // focus事件订阅
  private focusSubs?: () => void;

  // blur事件订阅
  private blurSubs?: () => void;

  // onResume事件订阅
  private onResumeSubs?: EmitterSubscription;

  // onPause事件订阅
  private onPauseSubs?: EmitterSubscription;

  // 安卓平台onBackground事件订阅
  private androidOnBackgroundSubs?: EmitterSubscription;

  // 安卓端是否已经添加过page/appstate变化监听
  // 安卓端这两个事件监听功能相同，都能同时监听onPause/onResume active/background 事件避免重复监听
  private androidHasAddPageAppstateListener: boolean = false;

  // 当前页面维护的APPstate数组
  private appStateList: CustomAppState[] = [];

  // 当前navigation变化的状态记录
  private navigationState: CustomNavigationState | null = null;

  // 当前page变化的状态记录
  private pageState: CustomPageState | null = null;

  // debounce时长
  private readonly debounceDuration: number = 1500;

  // 处理页面APPstate变化防抖timer
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // debounce函数里面使用的appstate
  private debounceUseAppState: AppStateStatus | null = null;

  // customAppState与Appstate映射关系
  private customAppStateMap: Map<AppStateStatus, CustomAppState> = new Map([
    ['active', CustomAppState.active],
    ['background', CustomAppState.background],
    ['inactive', CustomAppState.background],
  ]);

  // 安卓平台是否onBackground
  private androidOnBackground: boolean = false;

  // 页面生命周期信息
  // private lifeCycleHasExposedType: ExposeType | null = null;

  // 返回页面时判断出的临时变量exposeType，6或者7，在onShow事件中使用
  // private tmpFocusExposeType: ExposeType | null = null;

  // 组件的ref
  // private contentRef: React.RefObject<ScrollAnalytics>;

  // 延时检查是否收到onShow事件，在调用manuallyShow事件后，100ms后会触发onShow事件，如果超过100ms未收到onShow事件
  // 说明此元素被隐藏，不用触发onShow事件，清空记录的临时 从后台页面回来/其他页面回来的 变量
  private checkOnShowTimer: ReturnType<typeof setTimeout> | null = null;

  //
  // private readonly checkDelayDuration: number = 200;

  //
  // static contextTypes = {
  //   isDisablePageAnalytics: PropTypes.func,
  // };

  constructor(p: P & CustomProps) {
    super(p);
    // console.log(
    //   `scrollAnalyticComp内部 打印：this.props.navitaion ${this.props.navigation}`
    // );
    // this.contentRef = React.createRef<ScrollAnalytics>();
    // 添加路由监听
    this.addNavigationListener();
    // 添加page状态变化监听
    this.addPageListener();
    // 添加APPstate变化监听
    this.addAppStateListener();
    // 添加安卓平台onBackground事件监听
    this.addAndroidOnBackgroundListener();
  }

  // //
  // private checkIfDisabled = (): boolean => {
  //   return (
  //     this.context.isDisablePageAnalytics !== undefined &&
  //     this.context.isDisablePageAnalytics()
  //   );
  // };

  // 添加路由监听
  private addNavigationListener = () => {
    if (this.props.addFocusListener) {
      this.focusSubs = this.props.addFocusListener(this.onNavigationFocus);
    } else if (this.props.navigation) {
      this.focusSubs = this.props.navigation.addListener(
        'focus',
        this.onNavigationFocus
      );
    }
    if (this.props.addBlurListener) {
      this.blurSubs = this.props.addBlurListener(this.onNavigationBlur);
    } else if (this.props.navigation) {
      this.blurSubs = this.props.navigation.addListener(
        'blur',
        this.onNavigationBlur
      );
    }
  };

  // 根据不同的平台添加page状态变化监听
  private addPageListener = () => {
    if (isIos) {
      this.addPageChangeHandler();
      return;
    }
    if (this.androidHasAddPageAppstateListener) {
      return;
    }
    this.addPageChangeHandler();
    this.androidHasAddPageAppstateListener = true;
  };

  // 添加RN页面状态变化监听，从RN页面跳转到Native页面时触发onPause，回到RN页面时触发onResume
  private addPageChangeHandler = () => {
    this.onResumeSubs = PageEventEmitter.addListener(
      'onResume',
      this.onResumeHandler
    );
    this.onPauseSubs = PageEventEmitter.addListener(
      'onPause',
      this.onPauseHandler
    );
  };

  // 根据不同的平台添加appState状态变化监听
  private addAppStateListener = () => {
    if (isIos) {
      this.addAppStateChangeHandler();
      return;
    }
    if (this.androidHasAddPageAppstateListener) {
      return;
    }
    this.addAppStateChangeHandler();
    this.androidHasAddPageAppstateListener = true;
  };

  // 添加安卓平台onBackground事件监听
  private addAndroidOnBackgroundListener = () => {
    if (isAndroid) {
      this.androidOnBackgroundSubs = AndroidGlobalEventEmitter.addListener(
        'onBackground',
        this.androidOnBackgroundHandler
      );
    }
  };

  // 安卓平台onBackground事件handler
  private androidOnBackgroundHandler = () => {
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }
    console.log('androidOnBackground触发');
    this.androidOnBackground = true;
  };

  // 添加APPstate状态变化监听，切换到后台触发background，回来触发active
  private addAppStateChangeHandler = () => {
    AppState.addEventListener('change', this.appStateChangeHandler);
  };

  // APPstate状态更新防抖
  private appStateChangeHandler = (status: AppStateStatus) => {
    console.log('appStateChangeHandler');
    console.log(`appStateChangeHandler ${status} ${Date.now()}`);
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }

    if (status === this.debounceUseAppState) {
      return;
    }

    this.debounceTimer && clearTimeout(this.debounceTimer);
    this.debounceUseAppState = status;
    this.debounceTimer = setTimeout(() => {
      this.handleAppState(status);
    }, this.debounceDuration);
  };

  // APPstate状态变化处理
  private handleAppState = (status: AppStateStatus) => {
    const formerAppState = this.appStateList[this.appStateList.length - 1];
    const currentAppState = this.customAppStateMap.get(status);

    if (!currentAppState || formerAppState === currentAppState) {
      return;
    }
    this.appStateList.push(currentAppState);

    if (currentAppState === CustomAppState.active) {
      console.log(`appstate变化，active ${Date.now()}`);
      this.onFocus(PageViewExitEventSource.appState, formerAppState);
    } else {
      console.log(`appstate变化，background ${Date.now()}`);
      this.onBlur(PageViewExitEventSource.appState);
    }
  };

  // 页面与native页面相互跳转的处理
  private onResumeHandler = () => {
    console.log('onResumeHandler');
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }
    console.log(`onResume事件：`);
    this.onFocus(PageViewExitEventSource.page);
    this.androidOnBackground = false;
  };

  // 页面与native页面相互跳转的处理
  private onPauseHandler = () => {
    console.log('onPauseHandler');
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }
    console.log(`onPause事件：`);
    this.onBlur(PageViewExitEventSource.page);
  };

  // navigationOnFocus事件
  private onNavigationFocus = () => {
    console.log(`onNavigationFocus事件： `);
    this.onFocus(PageViewExitEventSource.navigation);
  };

  // navigationOnBlur事件
  private onNavigationBlur = () => {
    console.log(`onNavigationBlur事件：`);
    this.onBlur(PageViewExitEventSource.navigation);
  };

  // 处理从后台切换回来
  // private

  private sendCustomEvent = (event: CustomScrollAnalyticEvent, data: any) => {
    console.log(`sendCustomEvent  ${event} ${data} `);
    GlobalEventEmitter.emit(event, data);
  };

  // 页面显示操作
  private onFocus = async (
    source: PageViewExitEventSource,
    formerAppState?: CustomAppState
  ) => {
    if (isIos) {
      if (source === PageViewExitEventSource.navigation) {
        // 曝光type为6，从其他页面返回, 手动通知
        if (this.navigationState === CustomNavigationState.blur) {
          const exposeType =
            this.navigationState === CustomNavigationState.blur
              ? ExposeType.fromPage
              : null;
          this.navigationState = CustomNavigationState.focus;
          this.refreshLifeCycle();
          this.sendCustomEvent(CustomScrollAnalyticEvent.onFocus, {
            exposeType,
          });
          // this.checkExposedWhenRefreshLifeCycle(tmpType);
        }
      } else if (source === PageViewExitEventSource.page) {
        // 曝光type为6，从其他页面返回, 手动通知
        if (this.pageState === CustomPageState.pause) {
          const exposeType =
            this.pageState === CustomPageState.pause
              ? ExposeType.fromPage
              : null;
          this.pageState = CustomPageState.resume;
          this.refreshLifeCycle();
          this.sendCustomEvent(CustomScrollAnalyticEvent.onFocus, {
            exposeType,
          });
          // this.checkExposedWhenRefreshLifeCycle(tmpType);
        }
      } else if (source === PageViewExitEventSource.appState) {
        // 曝光type为7，从后台返回, 手动通知
        if (formerAppState === CustomAppState.background) {
          const exposeType =
            formerAppState === CustomAppState.background
              ? ExposeType.fromBackground
              : null;
          this.refreshLifeCycle();
          this.sendCustomEvent(CustomScrollAnalyticEvent.onFocus, {
            exposeType,
          });
          // this.checkExposedWhenRefreshLifeCycle(tmpType);
        }
      }
    }

    if (isAndroid) {
      if (source === PageViewExitEventSource.navigation) {
        // 曝光type为6，从其他页面返回, 手动通知
        if (this.navigationState === CustomNavigationState.blur) {
          const exposeType =
            this.navigationState === CustomNavigationState.blur
              ? ExposeType.fromPage
              : null;
          this.navigationState = CustomNavigationState.focus;
          this.refreshLifeCycle();
          this.sendCustomEvent(CustomScrollAnalyticEvent.onFocus, {
            exposeType,
          });
          // this.checkExposedWhenRefreshLifeCycle(tmpType);
        }
      } else if (
        source === PageViewExitEventSource.page ||
        source === PageViewExitEventSource.appState
      ) {
        if (this.androidOnBackground) {
          // 曝光type为7，从后台返回, 手动通知
          this.pageState = CustomPageState.resume;
          console.log('androidOnBackground frombackground');
          this.refreshLifeCycle();
          const exposeType = ExposeType.fromBackground;
          this.sendCustomEvent(CustomScrollAnalyticEvent.onFocus, {
            exposeType,
          });
          // this.checkExposedWhenRefreshLifeCycle(ExposeType.fromBackground);
        } else {
          // 曝光type为6，从其他页面返回, 手动通知
          if (this.pageState === CustomPageState.pause) {
            const exposeType =
              this.pageState === CustomPageState.pause
                ? ExposeType.fromPage
                : null;
            this.pageState = CustomPageState.resume;
            this.refreshLifeCycle();
            this.sendCustomEvent(CustomScrollAnalyticEvent.onFocus, {
              exposeType,
            });
            // this.checkExposedWhenRefreshLifeCycle(tmpType);
          }
        }
      }
    }
  };

  // 页面离开操作
  private onBlur = (source: PageViewExitEventSource) => {
    if (source === PageViewExitEventSource.navigation) {
      this.navigationState = CustomNavigationState.blur;
    } else if (source === PageViewExitEventSource.page) {
      this.pageState = CustomPageState.pause;
    } else if (source === PageViewExitEventSource.appState) {
      //
    }
    GlobalEventEmitter.emit(CustomScrollAnalyticEvent.onBlur, {});
    // this.notifyLeave();
  };

  // 手动查询曝光类型，在页面生命周期刷新时
  // private checkExposedWhenRefreshLifeCycle = (
  //   exposeType: ExposeType | null
  // ) => {
  //   if (this.checkIfDisabled()) {
  //     return;
  //   }
  //   InteractionManager.runAfterInteractions(() => {
  //     console.log('checkExposedWhenRefreshLifeCycle');
  //     this.contentRef.current
  //       ?.manuallyIsVisable()
  //       .then(({ isVisable, hasInteracted, hasViewed }) => {
  //         if (!isVisable || !exposeType) {
  //           return;
  //         }
  //         if (hasInteracted && hasViewed) {
  //           this.updateHasExposedType(exposeType);
  //           this.exposeHandler(exposeType);
  //         }
  //       });
  //   });
  // };

  // 手动通知从其他地方返回到此页面
  // private notifyBack = () => {
  //   this.checkOnShowTimer && clearTimeout(this.checkOnShowTimer);
  //   this.checkOnShowTimer = setTimeout(() => {
  //     this.tmpFocusExposeType = null;
  //   }, this.checkDelayDuration);

  //   console.log(
  //     `this.checkIfDisabled(): ${this.props.itemKey} ${this.checkIfDisabled()}`
  //   );
  //   if (this.checkIfDisabled()) {
  //     return;
  //   }
  //   //
  //   console.log('执行manuallyShow');
  //   this.contentRef.current?.manuallyShow();
  // };

  // // 手动通知离开页面
  // private notifyLeave = () => {
  //   // //
  //   // console.log('执行manuallyHide');
  //   // this.contentRef.current?.manuallyHide();
  // };

  // // 发送滑动曝光
  // private exposeHandler = (type: ExposeType) => {
  //   this.props.onShow(type);
  // };

  // private updateHasExposedType = (value: ExposeType): void => {
  //   this.lifeCycleHasExposedType = value;
  // };

  // private refreshLifeCycle = () => {
  //   this.lifeCycleHasExposedType = null;
  // };

  // private shouldExposeScroll = (): boolean => {
  //   // 一次生命周期内仅上报一次type(任何一种type类型)，如果已经曝光过，不再重复曝光
  //   return this.lifeCycleHasExposedType === null;
  // };

  // 发送滑动曝光，区分type
  // 0 冷启动，
  // 3 滑动产生的新内容曝光
  // 4 滑动产生的且历史被曝光过
  // 6 从其他页面返回
  // 7 从后台返回
  // 一个页面生命周期内，滑动曝光(type为 3 或 4)仅上报一次，离开页面后本次页面生命周期结束，返回页面开始一个新的页面生命周期
  // 在页面的上下左右滑动过程中，type=4事件 可能会多次触发，在一个生命周期内只上报一次
  // private onShow = (e: ShowEvent) => {
  //   console.log(`onshow ${e.hasInteracted} ${e.hasViewed}`);
  //   if (!e.hasInteracted) {
  //     if (!this.shouldExposeScroll()) {
  //       return;
  //     }
  //     // type为 0
  //     const exposeType = ExposeType.coldBoot;
  //     this.updateHasExposedType(exposeType);
  //     this.exposeHandler(exposeType);
  //     return;
  //   }

  //   if (e.hasInteracted && !e.hasViewed) {
  //     if (!this.shouldExposeScroll()) {
  //       return;
  //     }
  //     // type为 3
  //     const exposeType = ExposeType.newContent;
  //     this.updateHasExposedType(exposeType);
  //     this.exposeHandler(exposeType);
  //     return;
  //   }

  //   if (e.hasInteracted && e.hasViewed) {
  //     // 从其他页面返回/后台返回时，先手动通知，然后会收到此事件，如果是之前是从其他页面返回，type为6，如果是从后台返回，type为7，否则type为4
  //     // if (this.tmpFocusExposeType !== null) {
  //     //   // type为 6或7
  //     //   const exposeType = this.tmpFocusExposeType;
  //     //   this.tmpFocusExposeType = null;
  //     //   this.updateHasExposedType(exposeType);
  //     //   this.exposeHandler(exposeType);
  //     //   return;
  //     // }
  //     if (!this.shouldExposeScroll()) {
  //       return;
  //     }
  //     // type为 4
  //     const exposeType = ExposeType.hasExposed;
  //     this.updateHasExposedType(exposeType);
  //     this.exposeHandler(exposeType);
  //     return;
  //   }
  // };

  // private onHide = () => {
  //   this.props.onHide && this.props.onHide();
  // };

  // private onRefreshed = () => {
  //   this.refreshLifeCycle();
  //   this.props.onRefreshed && this.props.onRefreshed();
  // };

  render() {
    return <>{this.props.children}</>;
    // return (
    //   <>
    //     <ScrollAnalytics
    //       _key={this.props.itemKey}
    //       ref={this.contentRef}
    //       {...this.props}
    //       onShow={this.onShow}
    //       onHide={this.onHide}
    //       onRefreshed={this.onRefreshed}
    //     />
    //   </>
    // );
  }

  componentWillUnmount() {
    this.focusSubs && this.focusSubs();
    this.blurSubs && this.blurSubs();
    this.onResumeSubs && this.onResumeSubs.remove();
    this.onPauseSubs && this.onPauseSubs.remove();
    this.androidOnBackgroundSubs && this.androidOnBackgroundSubs.remove();
    this.debounceTimer && clearTimeout(this.debounceTimer);
    this.checkOnShowTimer && clearTimeout(this.checkOnShowTimer);
    AppState.removeEventListener('change', this.appStateChangeHandler);
  }
}

export type UseNaviType = <T extends NavigationProp<ParamListBase>>() => T;

function ScrollAnalyticsWithNavitaion(props: {
  useNavigation?: UseNaviType;
  [index: string]: any;
}) {
  let navigation;
  if (props.useNavigation) {
    try {
      navigation = props.useNavigation();
    } catch (e) {}
  }
  if (navigation) {
    return <ScrollAnalyticStore navigation={navigation} {...props} />;
  } else {
    return <ScrollAnalyticStore {...props} />;
  }
}

const ScrollAnalyticStoreWrapper = React.memo(ScrollAnalyticsWithNavitaion);

export default ScrollAnalyticStoreWrapper;
