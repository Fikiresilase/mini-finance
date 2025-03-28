import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../config/config';

const Card = ({ imageUri, name, originalPrice, sellingPrice, stock, category, onMarkSold }) => (
  <View style={styles.card}>
    <View style={styles.content}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {name}
        </Text>
        <Text style={styles.price} numberOfLines={1} ellipsizeMode="tail">
          Original: ${originalPrice.toFixed(2)}
        </Text>
        <Text style={styles.price} numberOfLines={1} ellipsizeMode="tail">
          Selling: ${sellingPrice.toFixed(2)}
        </Text>
        <Text style={styles.category} numberOfLines={1} ellipsizeMode="tail">
          Category: {category}
        </Text>
        <Text style={styles.stock} numberOfLines={1} ellipsizeMode="tail">
          Stock: {stock}
        </Text>
      </View>
    </View>
    <TouchableOpacity style={styles.soldButton} onPress={onMarkSold}>
      <MaterialIcons name="check-circle" size={20} color={COLORS.white} />
      <Text style={styles.soldText}>Sold</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius * 1.5,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 1.5,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  content: {
    flexDirection: 'row', // Image and text side by side
    marginBottom: SIZES.margin, // Space between content and button
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadius,
    marginRight: SIZES.margin * 2,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: SIZES.h3, // ~18px
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.margin * 0.8,
  },
  price: {
    fontSize: SIZES.body - 1, // ~15px
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.margin * 0.5,
  },
  category: {
    fontSize: SIZES.body - 1, // ~15px
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: SIZES.margin * 0.5,
  },
  stock: {
    fontSize: SIZES.body - 1, // ~15px
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  soldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.6,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignSelf: 'flex-start', // Align button to the left under text
  },
  soldText: {
    fontSize: SIZES.body - 2, // ~14px
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginLeft: SIZES.margin * 0.5,
  },
});

export default Card;