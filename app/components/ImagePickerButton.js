import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES } from '../config/config';

const ImagePickerButton = ({ imageUri, onImagePicked }) => {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} style={styles.container}>
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Text style={styles.changeText}>Change</Text>
        </>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.plus}>+</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SIZES.margin,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadius,
  },
  placeholder: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: SIZES.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    fontSize: 40,
    color: COLORS.primary,
  },
  changeText: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
  },
});

export default ImagePickerButton;