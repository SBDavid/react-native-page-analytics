import Screen, {
  Props,
  AnalyticDataProps,
  SendAnalyticFunc,
  PageExitDataGener,
} from './Screen';
import useScreen from './useScreen';
import ScreenUtils from './utils';

export type AnalyticProps = Props;
export type AnalyticPropsParams = AnalyticDataProps;
export type SendAnalyticFuncType = SendAnalyticFunc;
export type PageExitDataGenerType = PageExitDataGener;

ScreenUtils.setSendAnalyticAction(() => {});

export default {
  Screen,
  useScreen,
  ScreenUtils,
};
