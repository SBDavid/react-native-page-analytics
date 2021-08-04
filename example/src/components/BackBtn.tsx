import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import styled from 'styled-components';

export const BackBtnContainer = styled(View)`
  width: 150px;
  height: 25px;
  margin-top: 20px;
  background-color: white;
  display: flex;
  border-radius: 7px;
  border: 1px solid red;
  justify-content: center;
  align-items: center;
`;

export const BackBtnText = styled(Text)`
  font-size: 15px;
  color: red;
`;

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
