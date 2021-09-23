import * as React from 'react';
import {
  AppState,
  AppStateStatus,
  EmitterSubscription,
  NativeModules,
  NativeEventEmitter,
  Platform,
  TouchableHighlight,
  View,
  Text,
} from 'react-native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation, NavigationContext } from '@react-navigation/native';
import {
  PageEventEmitter,
  isIos,
  CustomAppState,
  PageViewExitEventSource,
  Props,
} from './Screen';
import ScrollAnalytics, {
  Props as ScrollProps,
  ShowEvent,
} from './ScrollAnalytic';

export enum ExposeType {
  // 冷启动
  coldBoot = 0,
  // 滑动产生的新内容曝光
  newContent = 3,
  // 滑动产生的且历史被曝光(3 或 4 在一个页面生命周期内仅上报一次)
  hasExposed = 4,
  // 从其他页面返回
  fromPage = 6,
  // 从后台返回
  fromBackground = 7,
}

// export interface ScreenLifeCycleInfo {

// }

const AndroidGlobalEventEmitter = new NativeEventEmitter(NativeModules.Page);
const isAndroid = Platform.OS === 'android';
class ScrollAnalyticContent<P, S> extends React.Component<
  P & Props & ScrollProps,
  S
> {
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
  private lifeCycleHasExposedType: ExposeType | null = null;

  // 返回页面时判断出的exposeType，6或者7
  private tmpFocusExposeType: ExposeType | null = null;

  constructor(p: P & Props & ScrollProps) {
    super(p);
    console.log(
      `scrollAnalyticComp内部 打印：this.props.navitaion ${this.props.navigation}`
    );
    // 添加路由监听
    this.addNavigationListener();
    // 添加page状态变化监听
    this.addPageListener();
    // 添加APPstate变化监听
    this.addAppStateListener();
    // 添加安卓平台onBackground事件监听
    this.addAndroidOnBackgroundListener();
  }

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
    console.log('androidOnBackground');
    this.androidOnBackground = true;
  };

  // 添加APPstate状态变化监听，切换到后台触发background，回来触发active
  private addAppStateChangeHandler = () => {
    AppState.addEventListener('change', this.appStateChangeHandler);
  };

  // APPstate状态更新防抖
  private appStateChangeHandler = (status: AppStateStatus) => {
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
      this.onFocus(PageViewExitEventSource.appState);
    } else {
      console.log(`appstate变化，background ${Date.now()}`);
      this.onBlur();
    }
  };

  // 页面与native页面相互跳转的处理
  private onResumeHandler = () => {
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }
    console.log(`onResume事件：`);
    if (isAndroid) {
      if (this.androidOnBackground) {
        // TODO 从后台切换回来，曝光type 6
      } else {
        // TODO 从Native页面切换回来，曝光type 7
      }
    }
    this.androidOnBackground = false;
    this.onFocus(PageViewExitEventSource.page);
  };

  // 页面与native页面相互跳转的处理
  private onPauseHandler = () => {
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }
    console.log(`onPause事件：`);
    this.onBlur();
  };

  // navigationOnFocus事件
  private onNavigationFocus = () => {
    console.log(`onNavigationFocus事件： `);
    this.onFocus(PageViewExitEventSource.navigation);
  };

  // navigationOnBlur事件
  private onNavigationBlur = () => {
    console.log(`onNavigationBlur事件：`);
    this.onBlur();
  };

  // 处理从后台切换回来
  // private

  // 页面显示操作
  private onFocus = async (source: PageViewExitEventSource) => {
    if (isIos) {
      if (source === PageViewExitEventSource.navigation) {
        // 曝光type为6，从其他页面返回, // TODO手动通知
        this.tmpFocusExposeType = ExposeType.fromPage;
        this.refreshLifeCycle();
        this.notifyBack();
      } else if (source === PageViewExitEventSource.page) {
        // 曝光type为6，从其他页面返回, // TODO手动通知
        this.tmpFocusExposeType = ExposeType.fromPage;
        this.refreshLifeCycle();
        this.notifyBack();
      } else if (source === PageViewExitEventSource.appState) {
        // 曝光type为7，从后台返回, // TODO手动通知
        this.tmpFocusExposeType = ExposeType.fromBackground;
        this.refreshLifeCycle();
        this.notifyBack();
      }
    }

    if (isAndroid) {
      if (source === PageViewExitEventSource.navigation) {
        // 曝光type为6，从其他页面返回, // TODO手动通知
        this.tmpFocusExposeType = ExposeType.fromPage;
        this.refreshLifeCycle();
        this.notifyBack();
      } else if (
        source === PageViewExitEventSource.page ||
        source === PageViewExitEventSource.appState
      ) {
        if (this.androidOnBackground) {
          // 曝光type为7，从后台返回, // TODO手动通知
          this.tmpFocusExposeType = ExposeType.fromBackground;
          this.refreshLifeCycle();
          this.notifyBack();
        } else {
          // 曝光type为6，从其他页面返回, // TODO手动通知
          this.tmpFocusExposeType = ExposeType.fromPage;
          this.refreshLifeCycle();
          this.notifyBack();
        }
      }
    }
  };

  // 页面离开操作
  private onBlur = () => {
    this.notifyLeave();
  };

  // 手动通知从其他地方返回到此页面
  private notifyBack = () => {
    //
  };

  // 手动通知离开页面
  private notifyLeave = () => {
    //
  };

  // 发送滑动曝光
  private exposeHandler = (type: ExposeType) => {
    console.log(`曝光类型：${type}`);
  };

  private updateHasExposedType = (value: ExposeType | null): void => {
    this.lifeCycleHasExposedType = value;
  };

  private refreshLifeCycle = () => {
    this.lifeCycleHasExposedType = null;
  };

  private shouldExposeScroll = (): boolean => {
    // 一次生命周期内仅上报一次type为3/4的滑动曝光，如果已经曝光过，不再重复曝光
    return this.lifeCycleHasExposedType === null;
  };

  // 发送滑动曝光，区分type
  // 0 冷启动，
  // 3 滑动产生的新内容曝光
  // 4 滑动产生的且历史被曝光过
  // 6 从其他页面返回
  // 7 从后台返回
  // 一个页面生命周期内，滑动曝光(type为 3 或 4)仅上报一次，离开页面后本次页面生命周期结束，返回页面开始一个新的页面生命周期
  // 在页面的上下左右滑动过程中，type=4事件 可能会多次触发，在一个生命周期内只上报一次
  private onShow = (e: ShowEvent) => {
    if (!e.hasInteracted) {
      this.exposeHandler(ExposeType.coldBoot);
      return;
    }

    if (e.hasInteracted && !e.hasViewed) {
      if (!this.shouldExposeScroll()) {
        return;
      }
      // type为 3
      const exposeType = ExposeType.newContent;
      this.updateHasExposedType(exposeType);
      this.exposeHandler(exposeType);
      return;
    }

    if (e.hasInteracted && e.hasViewed) {
      // 从其他页面返回/后台返回时，先手动通知，然后会收到此事件，如果是之前是从其他页面返回，type为6，如果是从后台返回，type为7，否则type为4
      if (this.tmpFocusExposeType !== null) {
        // type为 6或7
        const exposeType = this.tmpFocusExposeType;
        this.tmpFocusExposeType = null;
        this.exposeHandler(exposeType);
        return;
      }
      if (!this.shouldExposeScroll()) {
        return;
      }
      // type为 4
      const exposeType = ExposeType.hasExposed;
      this.updateHasExposedType(exposeType);
      this.exposeHandler(exposeType);
      return;
    }
  };

  private onHide = () => {};

  render() {
    return (
      <>
        <ScrollAnalytics
          {...this.props}
          onShow={this.onShow}
          onHide={this.onHide}
        />
      </>
    );
  }

  componentWillUnmount() {
    this.focusSubs && this.focusSubs();
    this.blurSubs && this.blurSubs();
    this.onResumeSubs && this.onResumeSubs.remove();
    this.onPauseSubs && this.onPauseSubs.remove();
    this.androidOnBackgroundSubs && this.androidOnBackgroundSubs.remove();
    this.debounceTimer && clearTimeout(this.debounceTimer);
    AppState.removeEventListener('change', this.appStateChangeHandler);
  }
}

function ScrollAnalyticsWithNavitaion(props: Props & ScrollProps) {
  const navigation = useNavigation();
  return <ScrollAnalyticContent {...props} />;
}

export function TestUseNavigation2(props: { title: string }) {
  const navigation = useNavigation();
  // const navigation = React.useContext(NavigationContext);
  console.log(`testUseNavigation2OuterProject print ${navigation}`);

  return (
    <TouchableHighlight onPress={() => navigation.navigate('screen2')}>
      <View>
        <Text style={{ fontSize: 25, color: 'red' }}>{props.title}</Text>
      </View>
    </TouchableHighlight>
  );
}

// const ScrollAnalyticComp = React.memo(ScrollAnalyticsWithNavitaion);

// export default ScrollAnalyticsWithNavitaion;
export default ScrollAnalyticContent;
