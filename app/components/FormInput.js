import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { COLORS, FONTS, SIZES } from '../config/config';

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', ...props }) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.disabled}
      keyboardType={keyboardType}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.margin,
  },
  label: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    fontSize: SIZES.body,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});

export default FormInput;