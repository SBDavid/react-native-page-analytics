import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import styled from 'styled-components';

interface CurrentPropType {
  handler: () => void;
  title: string;
}

const ButtonContainer = styled(View)`
  width: 200px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid green;
  margin-top: 25px;
  margin-left: 20px;
`;

const ButtonText = styled(Text)`
  font-size: 20px;
  color: red;
`;

export default function BackBtn(props: CurrentPropType) {
  return (
    <TouchableHighlight onPress={props.handler}>
      <ButtonContainer>
        <ButtonText>{props.title}</ButtonText>
      </ButtonContainer>
    </TouchableHighlight>
  );
}
