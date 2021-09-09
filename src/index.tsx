import Screen, { Props, AnalyticDataProps, PageExitDataGener } from './Screen';
import PureScreen from './PureScreen';
import useScreen from './useScreen';
import ScreenUtils, { SendAnalyticFunc } from './utils';

ScreenUtils.setDefaultSendAnalyticActions();

export type AnalyticProps = Props;
export type AnalyticPropsParams = AnalyticDataProps;
export type SendAnalyticFuncType = SendAnalyticFunc;
export type PageExitDataGenerType = PageExitDataGener;

export default {
  Screen,
  PureScreen,
  useScreen,
  ScreenUtils,
};
