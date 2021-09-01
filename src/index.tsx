import Screen, { Props, AnalyticDataProps, PageExitDataGener } from './Screen';
import PureScreen from './PureScreen';
import useScreen from './useScreen';
import ScreenUtils, { SendAnalyticFunc } from './utils';

ScreenUtils.setSendAnalyticActions({
  pageView: (
    metaId: number,
    currPage: string,
    props: { [index: string]: string }
  ) => {
    const xmlog = require('@xmly/xmlog-rn');
    xmlog.pageView(metaId, currPage, props);
  },
  pageExit: (
    metaId: number,
    currPage: string,
    props: { [index: string]: string }
  ) => {
    console.log(currPage);
    const xmlog = require('@xmly/xmlog-rn');
    xmlog.pageExit(metaId, props);
  },
});

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
