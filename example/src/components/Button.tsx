import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import styled from 'styled-components';

interface CurrentPropType {
  handler: () => void;
  title: string;
  selected?: boolean;
}

const ButtonContainer = styled(View)`
  width: 180px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid red;
  border-radius: 8px;
  margin-top: 25px;
  margin-left: 20px;
  background-color: ${(props: { selected: boolean }) =>
    props.selected ? 'blue' : 'white'};
`;

const ButtonText = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: ${(props: { selected: boolean }) =>
    props.selected ? 'white' : 'green'};
`;

export default function Button(props: CurrentPropType) {
  return (
    <TouchableHighlight onPress={props.handler}>
      <ButtonContainer selected={props.selected || false}>
        <ButtonText selected={props.selected || false}>
          {props.title}
        </ButtonText>
      </ButtonContainer>
    </TouchableHighlight>
  );
}
