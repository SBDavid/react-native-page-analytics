import Screen, { Props, AnalyticDataProps, PageExitDataGener } from './Screen';
import useScreen from './useScreen';
import ScreenUtils, { SendAnalyticFunc } from './utils';

export type AnalyticProps = Props;
export type AnalyticPropsParams = AnalyticDataProps;
export type SendAnalyticFuncType = SendAnalyticFunc;
export type PageExitDataGenerType = PageExitDataGener;

ScreenUtils.setSendAnalyticActions({
  pageView: () => {},
  pageExit: () => {},
});

export default {
  Screen,
  useScreen,
  ScreenUtils,
};
