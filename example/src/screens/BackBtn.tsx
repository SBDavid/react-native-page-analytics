import React from 'react';
import { View, Text, ScrollView, TouchableHighlight } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';
import styled from 'styled-components';
import { BackBtnContainer, BackBtnText } from './StyledComponents';

interface CurrentPropType {
  backBtnHandler: () => void;
}

export default function BackBtn(props: CurrentPropType) {
  return (
    <TouchableHighlight onPress={props.backBtnHandler}>
      <BackBtnContainer>
        <BackBtnText>返回</BackBtnText>
      </BackBtnContainer>
    </TouchableHighlight>
  );
}
