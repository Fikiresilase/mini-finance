import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import FormInput from './FormInput';
import Button from './Button';
import ImagePickerButton from './ImagePickerButton';
import { COLORS, SIZES, FONTS } from '../config/config';
import { MaterialIcons } from '@expo/vector-icons';

const AddItemScreen = ({ onAddItem }) => {
  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [imageUri, setImageUri] = useState(null);
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState([
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Clothing', value: 'Clothing' },
    { label: 'Books', value: 'Books' },
    { label: 'Other', value: 'Other' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories from SecureStore on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedCategories = await SecureStore.getItemAsync('categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        }
      } catch (error) {
        console.error('Error loading categories from SecureStore:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Save categories to SecureStore whenever they change
  useEffect(() => {
    const saveCategories = async () => {
      try {
        if (!isLoading) {
          await SecureStore.setItemAsync('categories', JSON.stringify(categories));
        }
      } catch (error) {
        console.error('Error saving categories to SecureStore:', error);
      }
    };
    saveCategories();
  }, [categories]);

  const handleSave = async () => {
    try {
      console.log('Saving item:', {
        name,
        originalPrice,
        sellingPrice,
        stock,
        category,
        imageUri,
      });

      if (
        !name ||
        !originalPrice ||
        !sellingPrice ||
        !stock ||
        !category ||
        isNaN(parseFloat(originalPrice)) ||
        isNaN(parseFloat(sellingPrice)) ||
        isNaN(parseInt(stock))
      ) {
        console.warn('Validation failed: All fields must be filled with valid numbers.');
        return;
      }

      const newItem = {
        id: Date.now().toString(), // Unique ID for each item
        name,
        originalPrice: parseFloat(originalPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock),
        category,
        imageUri,
      };

      // Load existing items from SecureStore
      let existingItems = [];
      const storedItems = await SecureStore.getItemAsync('items');
      if (storedItems) {
        existingItems = JSON.parse(storedItems);
      }

      // Ensure existingItems is an array
      if (!Array.isArray(existingItems)) {
        existingItems = [];
      }

      // Append new item and save back to SecureStore
      const updatedItems = [...existingItems, newItem];
      await SecureStore.setItemAsync('items', JSON.stringify(updatedItems));
      console.log('Item saved to SecureStore:', newItem);

      // Notify parent via callback
      if (onAddItem) {
        onAddItem(newItem);
      }

      // Reset form
      setName('');
      setOriginalPrice('');
      setSellingPrice('');
      setStock('');
      setCategory('Electronics');
      setImageUri(null);
    } catch (error) {
      console.error('Error in handleSave:', error);
    }
  };

  const addCustomCategory = () => {
    if (customCategory && !categories.some((cat) => cat.value === customCategory)) {
      const newCategory = { label: customCategory, value: customCategory };
      setCategories((prev) => [...prev, newCategory]);
      setCategory(newCategory.value);
      setCustomCategory('');
    }
  };

  if (isLoading) {
    return null; // Wait until categories are loaded
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Add New Item</Text>
        </View>
        <View style={styles.formContainer}>
          <ImagePickerButton imageUri={imageUri} onImagePicked={setImageUri} />
          <View style={styles.divider} />
          <FormInput label="Item Name" value={name} onChangeText={setName} />
          <View style={styles.divider} />
          <FormInput
            label="Original Price"
            value={originalPrice}
            onChangeText={setOriginalPrice}
            keyboardType="numeric"
          />
          <View style={styles.divider} />
          <FormInput
            label="Selling Price"
            value={sellingPrice}
            onChangeText={setSellingPrice}
            keyboardType="numeric"
          />
          <View style={styles.divider} />
          <FormInput
            label="Stock Count"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />
          <View style={styles.divider} />
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
              dropdownIconColor={COLORS.primary}
            >
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.value}
                  label={cat.label}
                  value={cat.value}
                  color={COLORS.text}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.divider} />
          <Text style={styles.label}>Add Custom Category</Text>
          <View style={styles.customCategoryContainer}>
            <FormInput
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder="Enter new category"
              style={styles.customCategoryInput}
            />
            <TouchableOpacity style={styles.addCategoryButton} onPress={addCustomCategory}>
              <MaterialIcons name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <Button
            title="Save Item"
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  contentContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 1.5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius + 2,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    marginBottom: SIZES.margin * 5,
  },
  header: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 1.5,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  headerText: {
    fontSize: SIZES.h1 + 2,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  formContainer: {
    padding: SIZES.padding * 1.2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.primary + '20',
    marginVertical: SIZES.margin * 0.8,
  },
  label: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 6,
  },
  pickerWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 40,
    color: COLORS.text,
  },
  customCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customCategoryInput: {
    flex: 1,
    marginRight: SIZES.margin,
  },
  addCategoryButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 0.5,
    borderRadius: SIZES.borderRadius,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.8,
    borderRadius: SIZES.borderRadius,
  },
});

export default AddItemScreen;