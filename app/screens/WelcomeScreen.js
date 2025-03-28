// app/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES, FONTS } from '../config/config';

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = async () => {
    try {
      // Mark the app as launched
      await SecureStore.setItemAsync('hasLaunched', 'true');
      // Navigate to the Main screen (which contains the tab navigator)
      navigation.replace('Main');
    } catch (error) {
      console.error('Error setting hasLaunched in SecureStore:', error);
      // Proceed anyway to avoid blocking the user
      navigation.replace('Main');
    }
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/welcome.json')} // Adjust path to your Lottie file
        autoPlay
        loop
        style={styles.lottie}
        resizeMode="contain" // Ensures the animation scales without adding background
      />
      <Text style={styles.title}>Welcome to Your Store!</Text>
      <Text style={styles.subtitle}>
        Track your sales, manage inventory, and grow your business with ease.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  lottie: {
    width: 300,
    height: 300,
    marginBottom: SIZES.margin,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: SIZES.h1 + 4,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.margin,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: SIZES.margin * 3,
    paddingHorizontal: SIZES.padding,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 1.2,
    paddingHorizontal: SIZES.padding * 3,
    borderRadius: SIZES.borderRadius + 2,
    elevation: 4,
  },
  buttonText: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default WelcomeScreen;