import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import LottieView from 'lottie-react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES, FONTS } from '../config/config';
import { useNavigation, useRoute } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [sales, setSales] = useState([]);
  const [timePeriod, setTimePeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const loadSales = async () => {
      try {
        const storedSales = await SecureStore.getItemAsync('sales');
        if (storedSales) {
          const parsedSales = JSON.parse(storedSales);
          if (!Array.isArray(parsedSales)) {
            setError('Invalid sales data detected');
            setSales([]);
            return;
          }
          setSales(parsedSales);
        } else {
          setSales([]);
        }
      } catch (error) {
        console.error('Error loading sales:', error);
        setError('Failed to load sales data');
        setSales([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadSales();
  }, []);

  
  useEffect(() => {
    if (route.params?.newSale) {
      setSales((prevSales) => [...prevSales, route.params.newSale]);
    }
  }, [route.params?.newSale]);

  const getSalesData = () => {
    const today = new Date();
    let periods, labelFormat, groupBy;

    switch (timePeriod) {
      case 'day':
        periods = 24; 
        labelFormat = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
        groupBy = (sale) => {
          const date = new Date(sale.timestamp);
          return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${date.getHours()}`;
        };
        break;
      case 'week':
        periods = 7; 
        labelFormat = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        groupBy = (sale) => new Date(sale.timestamp).toISOString().split('T')[0];
        break;
      case 'month':
        periods = 30; 
        labelFormat = (date) => date.toLocaleDateString('en-US', { day: 'numeric' });
        groupBy = (sale) => new Date(sale.timestamp).toISOString().split('T')[0];
        break;
      default:
        periods = 7;
        labelFormat = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        groupBy = (sale) => new Date(sale.timestamp).toISOString().split('T')[0];
    }

    
    const periodDates = Array(periods)
      .fill()
      .map((_, i) => {
        const date = new Date(today);
        if (timePeriod === 'day') {
          date.setHours(today.getHours() - (periods - 1 - i));
        } else {
          date.setDate(today.getDate() - (periods - 1 - i));
        }
        return date;
      });

    const salesByPeriod = periodDates.map((date) => {
      const key = timePeriod === 'day'
        ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${date.getHours()}`
        : date.toISOString().split('T')[0];
      return sales
        .filter((sale) => groupBy(sale) === key)
        .reduce((sum, sale) => sum + (sale.price || 0), 0);
    });

    return {
      labels: periodDates.map(labelFormat),
      datasets: [{ data: salesByPeriod }],
    };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noDataText}>Loading sales data...</Text>
      </View>
    );
  }

  const chartData = sales.length > 0 ? getSalesData() : null;
  const today = new Date().toISOString().split('T')[0];

  const todaySales = sales
    .filter((sale) => sale.timestamp.split('T')[0] === today)
    .reduce((sum, sale) => sum + (sale.price || 0), 0);

  const todayProfit = sales
    .filter((sale) => sale.timestamp.split('T')[0] === today)
    .reduce((sum, sale) => sum + ((sale.price || 0) - (sale.originalPrice || 0)), 0);

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => COLORS.primary,
    labelColor: (opacity = 1) => COLORS.text,
    style: { borderRadius: SIZES.borderRadius },
    propsForBackgroundLines: {
      stroke: COLORS.secondary,
      strokeWidth: 1,
      strokeDasharray: '4',
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
    fillShadowGradient: COLORS.primary,
    fillShadowGradientOpacity: 0.3,
  };

  const chartWidth = chartData ? Math.max(chartData.labels.length * (timePeriod === 'day' ? 60 : 40), screenWidth - SIZES.padding * 3) : screenWidth - SIZES.padding * 3;

  const periodOptions = [
    { label: 'Day', value: 'day', icon: 'access-time' },
    { label: 'Week', value: 'week', icon: 'calendar-view-week' },
    { label: 'Month', value: 'month', icon: 'calendar-month' },
  ];

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.card}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="attach-money" size={28} color={COLORS.primary} style={styles.statIcon} />
            <Text style={styles.statLabel}>Today’s Sales</Text>
            <Text style={styles.statValue}>${todaySales.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="trending-up" size={28} color={COLORS.primary} style={styles.statIcon} />
            <Text style={styles.statLabel}>Today’s Profit</Text>
            <Text style={styles.statValue}>${todayProfit.toFixed(2)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => navigation.navigate('SalesDetails')}
          accessibilityLabel="View sales details"
        >
          <MaterialIcons name="list" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          Sales Trend ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})
        </Text>
        <Text style={styles.chartSubtitle}>Overview</Text>
        <View style={styles.chartCardInner}>
          <View style={styles.chartCardHeader}>
            <View style={styles.pickerWrapper}>
              <MaterialIcons
                name={periodOptions.find((opt) => opt.value === timePeriod)?.icon || 'calendar-view-week'}
                size={14}
                color={COLORS.white}
                style={styles.pickerIcon}
              />
              <Picker
                selectedValue={timePeriod}
                onValueChange={(itemValue) => setTimePeriod(itemValue)}
                style={styles.picker}
                dropdownIconColor={COLORS.white}
                itemStyle={styles.pickerItem}
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
          {chartData ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                width={chartWidth}
                height={260}
                yAxisLabel="$"
                chartConfig={chartConfig}
                style={styles.chart}
                bezier
              />
            </ScrollView>
          ) : (
            <View style={styles.noDataContainer}>
              <LottieView
                source={require('../assets/no-data.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
              <View style={styles.noDataTextContainer}>
                <Text style={styles.noDataText}>
                  Sell items to track your sales here!
                </Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => navigation.navigate('Add Item')}
                  accessibilityLabel="Add new item"
                >
                  <MaterialIcons name="add" size={20} color={COLORS.white} style={styles.addButtonIcon} />
                  <Text style={styles.addButtonText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.padding * 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius + 2,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
    position: 'relative',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
  },
  statIcon: {
    marginBottom: 6,
  },
  statLabel: {
    fontSize: SIZES.body - 2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
  },
  statValue: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginTop: 8,
  },
  detailsButton: {
    position: 'absolute',
    top: SIZES.padding,
    right: SIZES.padding,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius + 4,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 5,
  },
  chartCardInner: {
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: SIZES.h1 + 2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin * 0.5,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: SIZES.margin,
  },
  chartCardHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 1.5,
    alignItems: 'center',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius * 1.5,
    paddingHorizontal: SIZES.padding * 0.6,
    paddingVertical: SIZES.padding * 0.3,
  },
  pickerIcon: {
    marginRight: 4,
  },
  picker: {
    width: 90,
    height: 28,
    color: COLORS.white,
  },
  pickerItem: {
    fontSize: SIZES.body - 2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  chart: {
    marginVertical: SIZES.padding * 1.5,
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.borderRadius,
  },
  lottie: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  noDataTextContainer: {
    alignItems: 'center',
    marginTop: SIZES.margin,
  },
  noDataText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error || 'red',
    fontSize: SIZES.body,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.8,
    paddingHorizontal: SIZES.padding * 1.5,
    borderRadius: SIZES.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonIcon: {
    marginRight: SIZES.margin * 0.5,
  },
  addButtonText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default DashboardScreen;