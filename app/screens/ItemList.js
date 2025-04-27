import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import Card from '../components/Card';
import { COLORS, SIZES, FONTS } from '../config/config';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ItemListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        
        const storedItems = await SecureStore.getItemAsync('items');
        let parsedItems = [];
        if (storedItems) {
          parsedItems = JSON.parse(storedItems);
          if (!Array.isArray(parsedItems)) {
            parsedItems = [];
          }
        }
        setItems(parsedItems);

        
        const storedCategories = await SecureStore.getItemAsync('categories');
        let parsedCategories = [{ label: 'All', value: 'All' }];
        if (storedCategories) {
          const categoriesFromStore = JSON.parse(storedCategories);
          if (Array.isArray(categoriesFromStore)) {
            parsedCategories = [
              { label: 'All', value: 'All' },
              ...categoriesFromStore,
            ];
          }
        }
        setCategories(parsedCategories);
      } catch (error) {
        console.error('Error loading data from SecureStore:', error);
        setError('Failed to load items or categories');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (route.params?.newItem) {
      setItems((prevItems) => {
        const exists = prevItems.some((item) => item.id === route.params.newItem.id);
        if (exists) return prevItems;
        return [...prevItems, route.params.newItem];
      });
    }
  }, [route.params?.newItem]);

  const handleMarkSold = async (itemId) => {
    try {
      setItems((prevItems) => {
        const soldItem = prevItems.find((item) => item.id === itemId);
        if (!soldItem || soldItem.stock <= 0) {
          console.log('Cannot mark sold: Item not found or out of stock:', itemId);
          setError('Cannot mark sold: Out of stock');
          return prevItems;
        }

        const updatedItems = prevItems.map((item) =>
          item.id === itemId ? { ...item, stock: item.stock - 1 } : item
        );

        
        SecureStore.setItemAsync('items', JSON.stringify(updatedItems)).catch((error) => {
          console.error('Error saving items to SecureStore:', error);
        });

        
        const sale = {
          itemId,
          name: soldItem.name,
          price: soldItem.sellingPrice,
          originalPrice: soldItem.originalPrice,
          category: soldItem.category,
          timestamp: new Date().toISOString(),
        };

        SecureStore.getItemAsync('sales')
          .then((storedSales) => {
            const salesArray = storedSales ? JSON.parse(storedSales) : [];
            if (!Array.isArray(salesArray)) {
              console.warn('Sales data is corrupted, resetting to empty array');
              return [];
            }
            const updatedSales = [...salesArray, sale];
            SecureStore.setItemAsync('sales', JSON.stringify(updatedSales));
            console.log('Sale saved to SecureStore:', sale);
            
           
          })
          .catch((error) => {
            console.error('Error saving sale to SecureStore:', error);
            setError('Failed to save sale');
          });

        return updatedItems;
      });
    } catch (error) {
      console.error('Error in handleMarkSold:', error);
      setError('Failed to mark item as sold');
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems =
    selectedCategory === 'All'
      ? safeItems.filter((item) => item.stock > 0)
      : safeItems.filter((item) => item.category === selectedCategory && item.stock > 0);

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
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Loading items...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>
            {safeItems.length === 0
              ? 'No items added yet.'
              : 'No items with available stock. Add more or check other categories.'}
          </Text>
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
                    <Picker.Item
                      key={cat.value}
                      label={cat.label}
                      value={cat.value}
                      color={COLORS.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <TouchableOpacity
              style={styles.salesButton}
              onPress={() => navigation.navigate('SalesDetails')}
              accessibilityLabel="View sales details"
            >
              <Text style={styles.salesButtonText}>View Sales Details</Text>
            </TouchableOpacity>
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.list}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  innerContainer: {
    flex: 1,
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
  errorText: {
    color: COLORS.error || 'red',
    fontSize: SIZES.body,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  salesButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 0.8,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  salesButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
  },
});

export default ItemListScreen;