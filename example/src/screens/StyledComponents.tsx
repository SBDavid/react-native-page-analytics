import { View, Text } from 'react-native';
import styled from 'styled-components';

export const Container = styled(View)`
  width: 100%;
  height: 100%;
  background-color: green;
`;

export const Item = styled(View)`
  width: 200px;
  height: 30px;
  margin-top: 15px;
  margin-left: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  border: 1px solid red;
`;

export const ItemText = styled(Text)`
  font-size: 15px;
  color: green;
  font-weight: bold;
`;

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

export const ContentContainer = styled(View)`
  background-color: green;
  margin-top: 30px;
  margin-left: 20px;
`;

export const ContentText = styled(Text)`
  font-size: 20px;
  color: white;
`;
