import { useEffect, useRef, useCallback } from 'react';
import { EmitterSubscription, AppState, AppStateStatus } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import {
  PageViewExitEventSource,
  AnalyticDataProps,
  isIos,
  PageEventEmitter,
  CustomAppState,
  PageTraceType,
} from './Screen';
import ScreenUtils from './utils';

interface ScreenHookProps {
  pageViewId?: number;
  pageExitId?: number;
  currPage?: string;
  customPageView: () => void;
  customPageExit: () => void;
  [index: string]: any;
}

type UpdatePagePropsFunc = (props: AnalyticDataProps) => void;
interface UseScreenReturnType {
  setPageViewProps: UpdatePagePropsFunc;
  setPageExitProps: UpdatePagePropsFunc;
}

export default function useScreen(props: ScreenHookProps): UseScreenReturnType {
  const {
    // pageViewId,
    // pageExitId,
    currPage,
    customPageView,
    customPageExit,
    // test,
  } = props;

  // 当前页面维护的APPstate数组
  const appStateListRef = useRef<CustomAppState[]>([]);

  // focus事件订阅
  let focusSubsRef = useRef<(() => void) | null>(null);

  //
  let hasFocusSubsRef = useRef<boolean>(false);

  // blur事件订阅
  let blurSubsRef = useRef<(() => void) | null>(null);

  //
  let hasBlurSubsRef = useRef<boolean>(false);

  // onResume事件订阅
  let onResumeSubsRef = useRef<EmitterSubscription | null>(null);

  // onPause事件订阅
  let onPauseSubsRef = useRef<EmitterSubscription | null>(null);

  // // pageview属性
  // let pageViewPropsRef = useRef<AnalyticDataProps | null>(null);

  // // pageExit属性
  // let pageExitPropsRef = useRef<AnalyticDataProps | null>(null);

  // // 设置pageViewProps等待resolve
  // let pageViewPropsResolveRef = useRef<((r: any) => void) | null>(null);

  // // 设置pageViewProps等待promise
  // let pageViewPropsPromiseRef = useRef<Promise<any> | null>(
  //   new Promise((resolve) => {
  //     pageViewPropsResolveRef.current = resolve;
  //   })
  // );

  // // 是否首次setPageViewProps
  // let hasSetPageViewPropsRef = useRef<boolean>(false);

  // 当前已经出发的pageView和pageExit事件记录
  let pageTraceListRef = useRef<PageTraceType[]>([]);

  //
  let delayCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 安卓端是否已经添加过page/appstate变化监听
  // 安卓端这两个事件监听功能相同，都能同时监听onPause/onResume active/background 事件避免重复监听
  let androidHasAddPageAppstateListenerRef = useRef<boolean>(false);

  // debounce时长
  const debounceDurationRef = useRef<number>(1500);

  // 处理页面APPstate变化防抖timer
  let debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // debounce函数里面使用的appstate
  let debounceUseAppStateRef = useRef<AppStateStatus | null>(null);

  // customAppState与Appstate映射关系
  let customAppStateMapRef = useRef<Map<AppStateStatus, CustomAppState>>(
    new Map([
      ['active', CustomAppState.active],
      ['background', CustomAppState.background],
      ['inactive', CustomAppState.background],
    ])
  );

  //
  // let navigation: ReturnType<typeof useNavigation> = useNavigation();
  let navigationRef = useRef<any>(props.navigation || null);

  //
  // 页面key
  let pageKeyRef = useRef<string>('');

  // 上传pageKey
  let pageShow = useCallback(() => {
    ScreenUtils.getPageShowAction()({ __pageKey: pageKeyRef.current });
  }, []);

  // 检查能否发送pageView或者pageExit事件，这两个事件应该是成对出现，避免连续发送pageView或者pageExit事件，
  // 除了首次，首次可以直接发送pageView事件
  let shouldSend = useCallback((type: PageTraceType): boolean => {
    return (
      (pageTraceListRef.current.length === 0 && type === 'focus') ||
      (pageTraceListRef.current.length > 0 &&
        pageTraceListRef.current[pageTraceListRef.current.length - 1] !== type)
    );
  }, []);

  // 发送数据操作
  let sendAnalyticAction = useCallback(
    (type: PageTraceType) => {
      // const sendActions = ScreenUtils.getSendAnalyticActions();
      // if (!sendActions) {
      //   console.log(`没有设置sendAnalyticAction，发送${type}事件失败`);
      //   return;
      // }

      // const { pageView, pageExit } = sendActions;

      if (!shouldSend(type)) {
        return;
      }

      if (type === 'focus') {
        // console.log('sendAnalyticAction focus');
        if (customPageView) {
          // console.log('customPageView 存在 执行');
          pageTraceListRef.current.push('focus');
          customPageView();
          // return;
        }
        // console.log(
        //   `发送页面pageView埋点 页面名: ${currPage} pageViewId: ${pageViewId} props: ${
        //     pageViewPropsRef.current
        //   } ${Date.now()}`
        // );
        // if (!pageView) {
        //   return;
        // }
        // pageTraceListRef.current.push('focus');
        // pageView(pageViewId, currPage, pageViewPropsRef.current || {});
        // return;
      }

      if (type === 'blur') {
        console.log('sendAnalyticAction blur');
        if (customPageExit) {
          // console.log('customPageExit 存在 执行');
          pageTraceListRef.current.push('blur');
          customPageExit();
          // return;
        }
        // console.log(
        //   `发送页面pageExit埋点 页面名: ${currPage} pageExitId: ${pageExitId} props: ${
        //     pageExitPropsRef.current
        //   } ${Date.now()}`
        // );
        // if (!pageExit) {
        //   return;
        // }
        // pageTraceListRef.current.push('blur');
        // pageExit(pageExitId, currPage, pageExitPropsRef.current || {});
        // return;
      }
    },
    [
      // currPage,
      // pageViewId,
      // pageExitId,
      customPageView,
      customPageExit,
      shouldSend,
    ]
  );

  // 页面显示操作
  let onFocus = useCallback(
    async (source: PageViewExitEventSource) => {
      // 有navigation的情况下，首次页面展示埋点如果是由onResume事件触发（可能有，可能没有）,过滤此次页面展示埋点，
      // 由首次页面展示埋点由onNavigatiionChange去触发
      if (
        hasFocusSubsRef.current &&
        hasBlurSubsRef.current &&
        source === PageViewExitEventSource.page &&
        ScreenUtils.getIsFirstPageView()
      ) {
        console.log('首次发送页面pageView埋点，触发来源为onResume，不发送');
        ScreenUtils.updateIsFirstPageView(false);
        return;
      }
      if (ScreenUtils.getIsFirstPageView()) {
        ScreenUtils.updateIsFirstPageView(false);
      }
      // await pageViewPropsPromiseRef.current;
      // ScreenUtils.currPage = currPage;
      sendAnalyticAction('focus');
    },
    [
      // currPage,
      sendAnalyticAction,
    ]
  );

  // 延时去检查是否发送了首次的页面pageView事件，如果没有发送，说明没有收到onNavigationFocus和onResume事件，手动补上一次pageView事件(首次pageView)
  let delayCheckFirstPageView = useCallback(() => {
    delayCheckTimerRef.current && clearTimeout(delayCheckTimerRef.current);
    delayCheckTimerRef.current = setTimeout(() => {
      console.log('delaycheckfirstpageview');
      if (!pageTraceListRef.current.includes('focus')) {
        console.log('delaycheckfirstpageview onfocus');
        pageShow();
        onFocus(PageViewExitEventSource.page);
      }
    }, 500);
  }, [onFocus, pageShow]);

  // 设置pageView埋点属性
  let setPageViewProps = useCallback<UpdatePagePropsFunc>(
    (prop: AnalyticDataProps) => {
      // if (!hasSetPageViewPropsRef.current) {
      //   hasSetPageViewPropsRef.current = true;
      //   delayCheckFirstPageView();
      // }
      // pageViewPropsRef.current = prop;
      // pageViewPropsResolveRef.current && pageViewPropsResolveRef.current(null);
      console.log(prop);
      delayCheckFirstPageView();
    },
    [delayCheckFirstPageView]
  );

  // 设置pageExit埋点属性
  let setPageExitProps = useCallback<UpdatePagePropsFunc>(
    (prop: AnalyticDataProps) => {
      // pageExitPropsRef.current = prop;
      console.log(prop);
    },
    []
  );

  // 页面离开操作
  let onBlur = useCallback(() => {
    sendAnalyticAction('blur');
  }, [sendAnalyticAction]);

  // navigationOnFocus事件
  let onNavigationFocus = useCallback(() => {
    console.log(`onNavigationFocus事件： 页面名：${currPage}`);
    pageShow();
    onFocus(PageViewExitEventSource.navigation);
  }, [currPage, pageShow, onFocus]);

  // navigationOnBlur事件
  let onNavigationBlur = useCallback(() => {
    console.log(`onNavigationBlur事件： 页面名：${currPage}`);
    onBlur();
  }, [currPage, onBlur]);

  // 添加路由监听
  let addNavigationListener = useCallback((): void => {
    if (props.addFocusListener) {
      focusSubsRef.current = props.addFocusListener(onNavigationFocus);
      hasFocusSubsRef.current = true;
    } else if (props.navigation) {
      focusSubsRef.current = props.navigation.addListener(
        'focus',
        onNavigationFocus
      );
      hasFocusSubsRef.current = true;
    }
    if (props.addBlurListener) {
      blurSubsRef.current = props.addBlurListener(onNavigationBlur);
      hasBlurSubsRef.current = true;
    } else if (props.navigation) {
      blurSubsRef.current = props.navigation.addListener(
        'blur',
        onNavigationBlur
      );
      hasBlurSubsRef.current = true;
    }
  }, [props, onNavigationFocus, onNavigationBlur]);

  // 页面与native页面相互跳转的处理
  let onResumeHandler = useCallback(() => {
    if (navigationRef.current && !navigationRef.current.isFocused()) {
      return;
    }
    console.log(`onResume事件： 页面名：${currPage}`);
    pageShow();
    onFocus(PageViewExitEventSource.page);
  }, [currPage, pageShow, onFocus]);

  // 页面与native页面相互跳转的处理
  let onPauseHandler = useCallback(() => {
    if (navigationRef.current && !navigationRef.current.isFocused()) {
      return;
    }
    console.log(`onPause事件： 页面名：${currPage}`);
    onBlur();
  }, [currPage, onBlur]);

  // 添加RN页面状态变化监听，从RN页面跳转到Native页面时触发onPause，回到RN页面时触发onResume
  let addPageChangeHandler = useCallback((): void => {
    onResumeSubsRef.current = PageEventEmitter.addListener(
      'onResume',
      onResumeHandler
    );
    onPauseSubsRef.current = PageEventEmitter.addListener(
      'onPause',
      onPauseHandler
    );
  }, [onPauseHandler, onResumeHandler]);

  // 根据不同的平台添加page状态变化监听
  let addPageListener = useCallback(() => {
    if (isIos) {
      addPageChangeHandler();
      return;
    }
    if (androidHasAddPageAppstateListenerRef.current) {
      return;
    }
    addPageChangeHandler();
    androidHasAddPageAppstateListenerRef.current = true;
  }, [addPageChangeHandler]);

  // APPstate状态变化处理
  let handleAppState = useCallback(
    (status: AppStateStatus) => {
      // if (status === 'active') {
      //   console.log(`appstate变化，active 页面名：${this.currPage}`);
      //   this.onFocus();
      // } else if (status === 'background') {
      //   console.log(`appstate变化，background 页面名：${this.currPage}`);
      //   this.onBlur();
      // } else if (status === 'inactive') {
      //   console.log(`appstate变化 inactive 页面名：${this.currPage}`);
      // }

      const formerAppState =
        appStateListRef.current[appStateListRef.current.length - 1];
      const currentAppState = customAppStateMapRef.current.get(status);

      if (!currentAppState || formerAppState === currentAppState) {
        return;
      }
      appStateListRef.current.push(currentAppState);

      if (currentAppState === CustomAppState.active) {
        console.log(`appstate变化，active 页面名：${currPage} ${Date.now()}`);
        onFocus(PageViewExitEventSource.appState);
      } else {
        console.log(
          `appstate变化，background 页面名：${currPage} ${Date.now()}`
        );
        onBlur();
      }
    },
    [currPage, onBlur, onFocus]
  );

  // APPstate状态更新防抖
  let appStateChangeHandler = useCallback(
    (status: AppStateStatus) => {
      console.log(`appStateChangeHandler ${status} ${currPage}  ${Date.now()}`);
      if (navigationRef.current && !navigationRef.current.isFocused()) {
        return;
      }

      if (status === debounceUseAppStateRef.current) {
        return;
      }

      debounceTimerRef.current && clearTimeout(debounceTimerRef.current);
      debounceUseAppStateRef.current = status;
      debounceTimerRef.current = setTimeout(() => {
        handleAppState(status);
      }, debounceDurationRef.current);
    },
    [currPage, handleAppState]
  );

  // 添加APPstate状态变化监听，切换到后台触发background，回来触发active
  let addAppStateChangeHandler = useCallback(() => {
    AppState.addEventListener('change', appStateChangeHandler);
  }, [appStateChangeHandler]);

  // 根据不同的平台添加appState状态变化监听
  let addAppStateListener = useCallback(() => {
    if (isIos) {
      addAppStateChangeHandler();
      return;
    }
    if (androidHasAddPageAppstateListenerRef.current) {
      return;
    }
    addAppStateChangeHandler();
    androidHasAddPageAppstateListenerRef.current = true;
  }, [addAppStateChangeHandler]);

  // 添加监听
  let addListeners = useCallback(() => {
    console.log('useScreen中添加监听');
    addNavigationListener();
    addPageListener();
    addAppStateListener();
  }, [addNavigationListener, addPageListener, addAppStateListener]);

  // 移除监听
  let removeListeners = useCallback(() => {
    try {
      focusSubsRef.current && focusSubsRef.current();
      blurSubsRef.current && blurSubsRef.current();
      onResumeSubsRef.current && onResumeSubsRef.current.remove();
      onPauseSubsRef.current && onPauseSubsRef.current.remove();
      debounceTimerRef.current && clearTimeout(debounceTimerRef.current);
      delayCheckTimerRef.current && clearTimeout(delayCheckTimerRef.current);
      AppState.removeEventListener('change', appStateChangeHandler);
    } catch (e) {}
  }, [appStateChangeHandler]);

  useEffect(() => {
    pageKeyRef.current = Date.now().toString();
    // pageShow();
    addListeners();
    delayCheckFirstPageView();
    return removeListeners;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    setPageViewProps,
    setPageExitProps,
  };
}
