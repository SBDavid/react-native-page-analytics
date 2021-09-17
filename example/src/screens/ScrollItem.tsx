import React from 'react';
import PageAnalytics, { AnalyticProps } from '../../../src';
import {
  ScrollView,
  TouchableHighlight,
  NativeModules,
  View,
} from 'react-native';

import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';

interface CurrentProps {}
interface CurrentState {}

export default class ScrollItem extends PageAnalytics.ScrollAnalyticItem<
  CurrentProps,
  CurrentState
> {
  constructor(props: CurrentProps) {
    super(props);
  }

  render() {
    return <View style={{ width: 100, height: 20, backgroundColor: 'red' }} />;
  }
}
