import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { apiPost, apiPut, API_ENDPOINTS } from '../../../utils/api';
import { getTempLocation, clearTempLocation } from './locationStorage';

const COMMON_SERVICES = [
  'Plastic',
  'Paper',
  'Glass',
  'Electronics',
  'Metal',
  'Batteries',
  'Organic Waste',
  'Hazardous Materials',
  'E-waste',
  'Textiles'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  openPeriod: string;
  closePeriod: string;
}

interface OperatingHours {
  [key: string]: DayHours;
}

interface TimeEdit {
  day: string;
  timeType: 'openTime' | 'closeTime';
}

export default function AddRecyclingCenterScreen() {
  const params = useLocalSearchParams();
  const editCenter = params.editCenter ? JSON.parse(params.editCenter as string) : null;

  const [name, setName] = useState(editCenter ? editCenter.name : '');
  const [address, setAddress] = useState(editCenter ? editCenter.address : '');
  const [phone, setPhone] = useState(editCenter ? editCenter.phone : '');
  const [website, setWebsite] = useState(editCenter ? editCenter.website : '');
  const [rating, setRating] = useState(editCenter ? editCenter.rating || 0 : 0);
  const [latitude, setLatitude] = useState(editCenter ? editCenter.latitude || '' : '');
  const [longitude, setLongitude] = useState(editCenter ? editCenter.longitude || '' : '');
  const [services, setServices] = useState<string[]>(
    editCenter ? editCenter.services || [] : []
  );
  
  // Normalize phone input: keep only digits and limit to 10 (no typing-time alerts)
  const handlePhoneChange = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
  };
  
  // Operating hours state
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(() => 
    editCenter ? parseOperatingHours(editCenter.hours) : initializeHours()
  );
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [currentTimeEdit, setCurrentTimeEdit] = useState<TimeEdit | null>(null);
  
  // Time input modal state
  const [timeInput, setTimeInput] = useState('09:00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  // Removed typing-time warnings; validation happens on save

  // Check for location from temporary storage when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      const tempLocation = getTempLocation();
      if (tempLocation) {
        console.log('Location received from map picker:', tempLocation);
        setLatitude(tempLocation.latitude);
        setLongitude(tempLocation.longitude);
        // Clear the temp storage after using it
        clearTempLocation();
      }
    }, [])
  );

  // Initialize hours structure
  function initializeHours(): OperatingHours {
    const hours: OperatingHours = {};
    DAYS_OF_WEEK.forEach(day => {
      hours[day] = {
        isOpen: false,
        openTime: '09:00',
        closeTime: '05:00',
        openPeriod: 'AM',
        closePeriod: 'PM'
      };
    });
    return hours;
  }

  // Parse existing hours string to structure
  function parseOperatingHours(hoursString?: string): OperatingHours {
    if (!hoursString) return initializeHours();
    
    try {
      const hours: OperatingHours = {};
      DAYS_OF_WEEK.forEach(day => {
        hours[day] = {
          isOpen: false,
          openTime: '09:00',
          closeTime: '05:00',
          openPeriod: 'AM',
          closePeriod: 'PM'
        };
      });
      
      // Parse existing format: "Mon: 09:00 AM - 05:00 PM, Tue: 09:00 AM - 05:00 PM"
      const dayHours = hoursString.split(', ');
      dayHours.forEach(dayHour => {
        const [dayShort, timeRange] = dayHour.split(': ');
        if (dayShort && timeRange) {
          const fullDay = DAYS_OF_WEEK.find(d => d.startsWith(dayShort));
          if (fullDay) {
            // Handle both "09:00AM-05:00PM", "09:00 AM-05:00 PM" and "09:00 AM - 05:00 PM" formats
            const [openTime, closeTime] = timeRange.split(/\s*-\s*/);
            if (openTime && closeTime) {
              // Handle both "09:00AM" and "09:00 AM" formats
              const openMatch = openTime.trim().match(/(\d{1,2}:\d{2})\s*(AM|PM)/i);
              const closeMatch = closeTime.trim().match(/(\d{1,2}:\d{2})\s*(AM|PM)/i);
              
              if (openMatch && closeMatch) {
                hours[fullDay] = {
                  isOpen: true,
                  openTime: openMatch[1],
                  closeTime: closeMatch[1],
                  openPeriod: openMatch[2].toUpperCase(),
                  closePeriod: closeMatch[2].toUpperCase()
                };
              }
            }
          }
        }
      });
      
      return hours;
    } catch (error) {
      console.log('Error parsing hours, using defaults:', error);
      return initializeHours();
    }
  }

  // Format hours structure to string for database
  function formatOperatingHours(): string {
    const openDays = DAYS_OF_WEEK.filter(day => operatingHours[day].isOpen);
    if (openDays.length === 0) return '';
    
    const formattedDays = openDays.map(day => {
      const { openTime, closeTime, openPeriod, closePeriod } = operatingHours[day];
      const openTimeFormatted = `${openTime} ${openPeriod}`;
      const closeTimeFormatted = `${closeTime} ${closePeriod}`;
      return `${day.substring(0, 3)}: ${openTimeFormatted} - ${closeTimeFormatted}`;
    });
    
    return formattedDays.join(', ');
  }

  const toggleService = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter(s => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  const toggleDay = (day: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen
      }
    }));
  };

  const openTimeModal = (day: string, timeType: 'openTime' | 'closeTime') => {
    setCurrentTimeEdit({ day, timeType });
    
    // Initialize modal with current values
    const currentTime = operatingHours[day][timeType];
    const currentPeriod = operatingHours[day][timeType === 'openTime' ? 'openPeriod' : 'closePeriod'];
    setTimeInput(currentTime);
    setSelectedPeriod(currentPeriod);
    
    setShowTimeModal(true);
  };

  const updateTime = (time: string, period: string) => {
    if (!currentTimeEdit) return;
    
    const { day, timeType } = currentTimeEdit;
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeType]: time,
        [timeType === 'openTime' ? 'openPeriod' : 'closePeriod']: period
      }
    }));
    setShowTimeModal(false);
    setCurrentTimeEdit(null);
  };

  const handleConfirmTime = () => {
    // Validate time format (HH:MM)
    const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]$/;
    if (!timeRegex.test(timeInput)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 05:00)');
      return;
    }
    
    updateTime(timeInput, selectedPeriod);
  };

  const handleCancelTime = () => {
    setShowTimeModal(false);
    setCurrentTimeEdit(null);
  };

  const renderTimeInputPopup = () => {
    if (!currentTimeEdit) return null;

    const { day, timeType } = currentTimeEdit;

    return (
      <View style={styles.timeInputContainer}>
        <Text style={styles.timeInputTitle}>
          Set {timeType === 'openTime' ? 'Opening' : 'Closing'} Time for {day}
        </Text>
        
        <View style={styles.timeInputRow}>
          <View style={styles.timeInputSection}>
            <Text style={styles.timeInputLabel}>Time</Text>
            <TextInput
              style={styles.timeTextInput}
              value={timeInput}
              onChangeText={setTimeInput}
              placeholder="05:00"
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={styles.timeInputHelper}>Format: HH:MM (e.g., 05:00)</Text>
          </View>
          
          <View style={styles.periodSection}>
            <Text style={styles.timeInputLabel}>Period</Text>
            <View style={styles.periodButtons}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'AM' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('AM')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'AM' && styles.periodButtonTextActive
                ]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'PM' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('PM')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'PM' && styles.periodButtonTextActive
                ]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.timeModalButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelTime}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmTime}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <MaterialIcons
              name={star <= rating ? 'star' : 'star-border'}
              size={32}
              color={star <= rating ? '#FFD700' : '#E0E0E0'}
            />
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>
          {rating > 0 ? `${rating}.0` : 'No rating'}
        </Text>
      </View>
    );
  };

  const handleSave = async () => {
    // 1. Validate name
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a center name');
      return;
    }

    // 2. Validate address
    if (!address.trim()) {
      Alert.alert('Required Field', 'Please enter an address');
      return;
    }

    // 3. Validate phone number
    if (!phone.trim()) {
      Alert.alert('Required Field', 'Please enter a phone number');
      return;
    }

    // 3.1 Give priority: letters/symbols not allowed
    if (/\D/.test(phone)) {
      Alert.alert('Invalid Phone Number', 'Phone number can only contain digits (0-9)');
      return;
    }

    // 3.2 Validate exact length
    const phoneDigits = phone.replace(/\D/g, ''); // Remove non-digits
    if (phoneDigits.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Phone number must be exactly 10 digits');
      return;
    }

    // 4. Validate operating hours - at least one day should be selected
    const hoursString = formatOperatingHours();
    if (!hoursString) {
      Alert.alert('Required Field', 'Please select at least one operating day');
      return;
    }

    // 5. Validate website with dot format check
    if (!website.trim()) {
      Alert.alert('Required Field', 'Please enter a website');
      return;
    }

    // Check if website has proper format (must contain a dot)
    if (!website.includes('.')) {
      Alert.alert('Invalid Website', 'Please enter a valid website format (e.g., ecocenter.com)');
      return;
    }

    // 6. Validate rating
    if (rating === 0) {
      Alert.alert('Required Field', 'Please provide a rating');
      return;
    }

    // 7. Validate location
    if (!latitude || !longitude) {
      Alert.alert('Required Field', 'Please select a location on the map');
      return;
    }

    // 8. Validate services - at least one service should be selected
    if (services.length === 0) {
      Alert.alert('Required Field', 'Please select at least one service');
      return;
    }

    const ratingNum = rating;

    const centerData = {
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      hours: hoursString,
      services: services,
      website: website.trim(),
      rating: ratingNum,
      latitude: latitude || null,
      longitude: longitude || null,
    };

    console.log('Saving center with data:', centerData);

    try {
      if (editCenter) {
        await apiPut(`${API_ENDPOINTS.CENTERS}/${editCenter.id}`, centerData);
      } else {
        await apiPost(API_ENDPOINTS.CENTERS, centerData);
      }

      // Navigate back to previous screen (centers list)
      router.back();
    } catch (error) {
      console.error('Error saving recycling center:', error);
      Alert.alert('Error', 'Failed to save recycling center');
    }
  };

  return (
    <View style={styles.container}>
      {/* Green Header */}
      <View style={styles.greenHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.greenHeaderTitle}>
          {editCenter ? 'Edit Recycling Center' : 'Add Recycling Center'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.label}>Center Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., EcoCenter Recycling Facility"
          />

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g., 123 Green Street, Downtown"
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="e.g., 0712345678"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Operating Hours *</Text>
          <View style={styles.hoursContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} style={styles.dayRow}>
                <TouchableOpacity
                  style={styles.dayCheckbox}
                  onPress={() => toggleDay(day)}
                >
                  <MaterialIcons
                    name={operatingHours[day].isOpen ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={operatingHours[day].isOpen ? '#4CAF50' : '#E0E0E0'}
                  />
                  <Text style={[styles.dayText, operatingHours[day].isOpen && styles.dayTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
                
                {operatingHours[day].isOpen && (
                  <View style={styles.timeRow}>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => openTimeModal(day, 'openTime')}
                    >
                      <Text style={styles.timeButtonText}>
                        {operatingHours[day].openTime} {operatingHours[day].openPeriod}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.timeSeparator}>to</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => openTimeModal(day, 'closeTime')}
                    >
                      <Text style={styles.timeButtonText}>
                        {operatingHours[day].closeTime} {operatingHours[day].closePeriod}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>

          <Text style={styles.label}>Website *</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="e.g., ecocenter.com"
            keyboardType="url"
          />

          <Text style={styles.label}>Rating *</Text>
          {renderStarRating()}

          <Text style={styles.label}>Location *</Text>
          <TouchableOpacity
            style={styles.mapPickerButton}
            onPress={() => router.push({
              pathname: '/screens/recyclingcenters/MapPickerScreen',
              params: {
                latitude: latitude || '',
                longitude: longitude || '',
              }
            })}
          >
            <MaterialIcons name="location-on" size={24} color="#4CAF50" />
            <View style={styles.mapPickerTextContainer}>
              <Text style={styles.mapPickerButtonText}>
                {latitude && longitude ? 'Location Selected' : 'Select Location on Map'}
              </Text>
              {latitude && longitude && (
                <Text style={styles.mapPickerCoords}>
                  Lat: {parseFloat(latitude).toFixed(6)}, Lng: {parseFloat(longitude).toFixed(6)}
                </Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Services *</Text>
          <View style={styles.optionsContainer}>
            {COMMON_SERVICES.map((service) => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.optionChip,
                  services.includes(service) && styles.optionChipActive
                ]}
                onPress={() => toggleService(service)}
              >
                <Text style={[
                  styles.optionChipText,
                  services.includes(service) && styles.optionChipTextActive
                ]}>
                  {service}
                </Text>
                {services.includes(service) && (
                  <MaterialIcons name="check" size={16} color="white" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {editCenter ? 'Save Changes' : 'Add Center'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Time Selection Modal */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity
                onPress={() => setShowTimeModal(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {renderTimeInputPopup()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  greenHeader: {
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  greenHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  form: { 
    padding: 16,
    paddingBottom: 32,
  },
  label: { 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 6, 
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  optionChip: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionChipText: {
    fontSize: 14,
    color: '#666',
  },
  optionChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  
  // Operating Hours Styles
  hoursContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 12,
  },
  dayRow: {
    marginBottom: 12,
  },
  dayCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    minWidth: 80,
  },
  dayTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 32,
    gap: 12,
  },
  timeButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#666',
  },
  
  // Star Rating Styles
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '600',
  },
  
  // Map Picker Button Styles
  mapPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    gap: 12,
  },
  mapPickerTextContainer: {
    flex: 1,
  },
  mapPickerButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mapPickerCoords: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  // Time Input Popup Styles
  timeInputContainer: {
    padding: 20,
  },
  timeInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  timeInputSection: {
    flex: 1,
    marginRight: 15,
  },
  periodSection: {
    flex: 0.8,
  },
  timeInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  timeTextInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  timeInputHelper: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  periodButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
