import Screen, {
  Props,
  AnalyticDataProps,
  SendAnalyticFunc,
  PageExitDataGener,
} from './Screen';

import useScreen, { ScreenHookUtils } from './useScreen';

export type AnalyticProps = Props;
export type AnalyticPropsParams = AnalyticDataProps;
export type SendAnalyticFuncType = SendAnalyticFunc;
export type PageExitDataGenerType = PageExitDataGener;

ScreenHookUtils.setSendAnalyticAction(() => {});

export default {
  Screen,
  useScreen,
};
