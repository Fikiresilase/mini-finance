import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../config/config';

const SalesDetailsScreen = () => {
  const [sales, setSales] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('day');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const storedSales = await SecureStore.getItemAsync('sales');
        console.log('Raw stored sales from SecureStore:', storedSales);
        if (storedSales) {
          const parsedSales = JSON.parse(storedSales);
          console.log('Parsed sales:', parsedSales);
          setSales(Array.isArray(parsedSales) ? parsedSales : []);
        } else {
          console.log('No sales found in SecureStore');
          setSales([]);
        }
      } catch (error) {
        console.error('Error loading sales from SecureStore:', error);
        setSales([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadSales();
  }, []);

  const getFilteredSales = () => {
    const today = new Date();
    let startDate;

    switch (filterPeriod) {
      case 'day':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(today.setDate(today.getDate() - 30));
        break;
      default:
        startDate = new Date(today.setHours(0, 0, 0, 0));
    }

    const filtered = sales.filter((sale) => new Date(sale.timestamp) >= startDate);
    console.log('Filtered sales for period', filterPeriod, ':', filtered);
    return filtered;
  };

  const filteredSales = getFilteredSales();
  const totalItemsSold = filteredSales.length;
  const totalSell = filteredSales.reduce((sum, sale) => sum + sale.price, 0);
  const totalProfit = filteredSales.reduce(
    (sum, sale) => sum + (sale.price - (sale.originalPrice || 0)),
    0
  );

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, styles.column]}>Name</Text>
      <Text style={[styles.headerText, styles.column]}>Sell</Text>
      <Text style={[styles.headerText, styles.column]}>Cost</Text>
      <Text style={[styles.headerText, styles.column]}>Gain</Text>
      <Text style={[styles.headerText, styles.column]}>Category</Text>
      <Text style={[styles.headerText, styles.column]}>Date</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const profit = item.price - (item.originalPrice || 0);
    const date = new Date(item.timestamp).toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    return (
      <View style={styles.tableRow}>
        <Text style={[styles.rowText, styles.column]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.rowText, styles.column]}>${item.price.toFixed(2)}</Text>
        <Text style={[styles.rowText, styles.column]}>${(item.originalPrice || 0).toFixed(2)}</Text>
        <Text style={[styles.rowText, styles.column]}>${profit.toFixed(2)}</Text>
        <Text style={[styles.rowText, styles.column]} numberOfLines={1}>
          {item.category}
        </Text>
        <Text style={[styles.rowText, styles.column]}>{date}</Text>
      </View>
    );
  };

  const periodOptions = [
    { label: 'Day', value: 'day', icon: 'access-time' },
    { label: 'Week', value: 'week', icon: 'calendar-view-week' },
    { label: 'Month', value: 'month', icon: 'calendar-month' },
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>Loading sales...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <MaterialIcons
            name={periodOptions.find((opt) => opt.value === filterPeriod).icon}
            size={16}
            color={COLORS.text}
            style={styles.pickerIcon}
          />
          <Picker
            selectedValue={filterPeriod}
            onValueChange={(itemValue) => setFilterPeriod(itemValue)}
            style={styles.picker}
            dropdownIconColor={COLORS.text}
          >
            {periodOptions.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
                color={COLORS.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="shopping-cart" size={24} color={COLORS.primary} style={styles.statIcon} />
          <Text style={styles.statLabel}>Sold</Text>
          <Text style={styles.statValue}>{totalItemsSold}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="attach-money" size={24} color={COLORS.primary} style={styles.statIcon} />
          <Text style={styles.statLabel}>Sales</Text>
          <Text style={styles.statValue}>${totalSell.toFixed(2)}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="trending-up" size={24} color={COLORS.primary} style={styles.statIcon} />
          <Text style={styles.statLabel}>Profit</Text>
          <Text style={styles.statValue}>${totalProfit.toFixed(2)}</Text>
        </View>
      </View>

      {filteredSales.length > 0 ? (
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {renderHeader()}
              <FlatList
                data={filteredSales}
                renderItem={renderItem}
                keyExtractor={(item) => item.itemId + item.timestamp}
                contentContainerStyle={styles.tableBody}
              />
            </View>
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.noData}>No sales recorded for this period.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding * 1.5,
  },
  filterContainer: {
    marginBottom: SIZES.margin,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.text + '20',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.3,
  },
  pickerIcon: {
    marginRight: SIZES.margin * 0.5,
  },
  picker: {
    flex: 1,
    height: 40,
    color: COLORS.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin * 1.5,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SIZES.margin * 0.5,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  statIcon: {
    marginBottom: SIZES.margin * 0.5,
  },
  statLabel: {
    fontSize: SIZES.body - 2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginTop: SIZES.margin * 0.5,
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
  },
  headerText: {
    fontSize: SIZES.body - 1,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '20',
  },
  rowText: {
    fontSize: SIZES.body - 2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
  },
  column: {
    width: 120,
    paddingHorizontal: SIZES.padding * 0.5,
  },
  tableBody: {
    paddingBottom: SIZES.padding,
  },
  noData: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SIZES.margin * 2,
  },
});

export default SalesDetailsScreen;