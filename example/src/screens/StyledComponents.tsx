import { View, Text, TouchableHighlight, SafeAreaView } from 'react-native';
import styled from 'styled-components';

export const Container = styled(View)``;

export const Item = styled(View)`
  width: 100px;
  height: 20px;
  background-color: rgba(
    255,
    0,
    0,
    ${(props: { index: number }) => 0.3 + props.index * 0.1}
  );
`;

export const ItemText = styled(Text)`
  font-size: 20px;
  color: green;
  font-weight: bold;
`;

export const BackBtnContainer = styled(View)`
  width: 150px;
  height: 25px;
`;

export const BackBtnText = styled(Text)`
  font-size: 15px;
  color: black;
`;
