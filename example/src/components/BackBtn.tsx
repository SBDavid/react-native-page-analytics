import React from 'react';
import { TouchableHighlight } from 'react-native';
import { BackBtnContainer, BackBtnText } from '../screens/StyledComponents';

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
