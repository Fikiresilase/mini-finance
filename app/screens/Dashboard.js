import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import LottieView from 'lottie-react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SIZES, FONTS } from '../config/config';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }) => {
  const [sales, setSales] = useState([]);
  const [timePeriod, setTimePeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);

  // Load sales from SecureStore on mount
  useEffect(() => {
    const loadSales = async () => {
      try {
        const storedSales = await SecureStore.getItemAsync('sales');
        console.log('Raw stored sales from SecureStore:', storedSales); // Debug raw data
        if (storedSales) {
          const parsedSales = JSON.parse(storedSales);
          console.log('Parsed sales:', parsedSales); // Debug parsed data
          setSales(Array.isArray(parsedSales) ? parsedSales : []);
        } else {
          console.log('No sales found in SecureStore');
          setSales([]);
        }
      } catch (error) {
        console.error('Error loading sales from SecureStore:', error);
        setSales([]); // Fallback to empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    loadSales();
  }, []);

  const getSalesData = () => {
    const today = new Date();
    let days, labelFormat;

    switch (timePeriod) {
      case 'day':
        days = 24;
        labelFormat = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        break;
      case 'week':
        days = 7;
        labelFormat = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
        days = 30;
        labelFormat = (date) => date.toLocaleDateString('en-US', { day: 'numeric' });
        break;
      default:
        days = 7;
        labelFormat = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Generate days starting from today and going backward
    const periodDays = Array(days)
      .fill()
      .map((_, i) => {
        const date = new Date(today);
        if (timePeriod === 'day') {
          date.setHours(today.getHours() - (days - 1 - i)); // Start from earliest hour to today
        } else {
          date.setDate(today.getDate() - (days - 1 - i)); // Start from earliest day to today
        }
        return date;
      });

    const salesByPeriod = periodDays.map((date) => {
      const dateStr = timePeriod === 'day'
        ? date.toISOString().split('T')[0] + 'T' + date.toISOString().split('T')[1].slice(0, 2)
        : date.toISOString().split('T')[0];
      const periodSales = sales
        .filter((sale) => {
          const saleDate = sale.timestamp.split('T')[0];
          if (timePeriod === 'day') {
            const saleHour = sale.timestamp.split('T')[1].slice(0, 2);
            return saleDate === dateStr.split('T')[0] && saleHour === dateStr.split('T')[1];
          }
          return saleDate === dateStr;
        })
        .reduce((sum, sale) => sum + sale.price, 0);
      return periodSales;
    });

    return {
      labels: periodDays.map(labelFormat),
      datasets: [{ data: salesByPeriod }],
    };
  };

  if (isLoading) {
    return (
      <View style={styles.scrollContainer}>
        <Text style={styles.noDataText}>Loading sales data...</Text>
      </View>
    );
  }

  const chartData = sales && sales.length > 0 ? getSalesData() : null;
  const today = new Date().toISOString().split('T')[0];

  const todaySales = sales
    .filter((sale) => sale.timestamp.split('T')[0] === today)
    .reduce((sum, sale) => sum + sale.price, 0);

  const todayProfit = sales
    .filter((sale) => sale.timestamp.split('T')[0] === today)
    .reduce((sum, sale) => sum + (sale.price - (sale.originalPrice || 0)), 0);

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => '#00695C',
    labelColor: (opacity = 1) => COLORS.text,
    style: {
      borderRadius: SIZES.borderRadius,
    },
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
    fillShadowGradient: '#00695C',
    fillShadowGradientOpacity: 0.3,
  };

  const chartWidth = chartData ? chartData.labels.length * (timePeriod === 'day' ? 60 : 40) : 0;

  const periodOptions = [
    { label: 'Day', value: 'day', icon: 'access-time' },
    { label: 'Week', value: 'week', icon: 'calendar-view-week' },
    { label: 'Month', value: 'month', icon: 'calendar-month' },
  ];

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      {/* Stats Card with Details Icon */}
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
        >
          <MaterialIcons name="list" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Chart Card with Picker */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          Sales Trend ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})
        </Text>
        <Text style={styles.chartSubtitle}>Overview</Text>
        <View style={styles.chartCardInner}>
          <View style={styles.chartCardHeader}>
            <View style={styles.pickerWrapper}>
              <MaterialIcons
                name={periodOptions.find((opt) => opt.value === timePeriod).icon}
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
                    color="#333"
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
                  onPress={() => navigation?.navigate('Add Item')}
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
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: '#00695C',
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