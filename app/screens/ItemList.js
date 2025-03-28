import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import Card from '../components/Card';
import { COLORS, SIZES, FONTS } from '../config/config';

const ItemListScreen = ({ onMarkSold }) => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const storedItems = await SecureStore.getItemAsync('items');
        console.log('Raw stored items from SecureStore:', storedItems);
        if (storedItems) {
          const parsedItems = JSON.parse(storedItems);
          setItems(Array.isArray(parsedItems) ? parsedItems : []);
        }
      } catch (error) {
        console.error('Error loading items from SecureStore:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, []);

  useEffect(() => {
    const saveItems = async () => {
      try {
        if (!isLoading) {
          await SecureStore.setItemAsync('items', JSON.stringify(items));
        }
      } catch (error) {
        console.error('Error saving items to SecureStore:', error);
      }
    };
    saveItems();
  }, [items]);

  const handleMarkSold = async (itemId) => {
    setItems((prevItems) => {
      const soldItem = prevItems.find((item) => item.id === itemId);
      if (!soldItem || soldItem.stock <= 0) {
        console.log('Cannot mark sold: Item not found or out of stock:', itemId);
        return prevItems;
      }

      const updatedItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, stock: item.stock - 1 } : item
      );

      // Save sale to SecureStore
      const sale = {
        itemId,
        name: soldItem.name,
        price: soldItem.sellingPrice,
        originalPrice: soldItem.originalPrice,
        category: soldItem.category,
        timestamp: new Date().toISOString(),
      };

      // Append sale to existing sales
      SecureStore.getItemAsync('sales')
        .then((storedSales) => {
          const salesArray = storedSales ? JSON.parse(storedSales) : [];
          const updatedSales = [...salesArray, sale];
          SecureStore.setItemAsync('sales', JSON.stringify(updatedSales));
          console.log('Sale saved to SecureStore:', sale);
        })
        .catch((error) => {
          console.error('Error saving sale to SecureStore:', error);
        });

      if (onMarkSold) onMarkSold(itemId);
      return updatedItems;
    });
  };

  const safeItems = Array.isArray(items) ? items : [];
  const categories = ['All', ...new Set(safeItems.map((item) => item.category).filter(Boolean))];

  const filteredItems =
    selectedCategory === 'All'
      ? safeItems
      : safeItems.filter((item) => item.category === selectedCategory);

  const renderItem = ({ item }) => {
    try {
      return (
        <Card
          imageUri={item.imageUri || null}
          name={item.name || 'Unnamed'}
          originalPrice={typeof item.originalPrice === 'number' ? item.originalPrice : 0}
          sellingPrice={typeof item.sellingPrice === 'number' ? item.sellingPrice : 0}
          stock={typeof item.stock === 'number' ? item.stock : 0}
          category={item.category || 'Uncategorized'}
          onMarkSold={() => handleMarkSold(item.id)}
        />
      );
    } catch (error) {
      console.error('Error rendering item:', item, error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {safeItems.length === 0 ? (
        <Text style={styles.emptyText}>No items added yet.</Text>
      ) : (
        <>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Category:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                style={styles.picker}
                dropdownIconColor={COLORS.primary}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} color={COLORS.text} />
                ))}
              </Picker>
            </View>
          </View>
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
    marginBottom: SIZES.margin * 5,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin * 1.5,
  },
  filterLabel: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginRight: SIZES.margin * 1.5,
  },
  pickerWrapper: {
    flex: 1,
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
  list: {
    paddingBottom: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SIZES.margin * 2,
  },
});

export default ItemListScreen;