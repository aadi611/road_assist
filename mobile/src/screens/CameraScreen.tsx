import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');

interface CameraScreenProps {
  navigation: any;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'CivicReport needs access to your location to tag infrastructure issues',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // iOS permissions are handled automatically by Geolocation
        setHasLocationPermission(true);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    if (!hasLocationPermission) {
      Alert.alert('Permission Required', 'Location permission is required to report issues');
      return;
    }

    setIsCapturingLocation(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setIsCapturingLocation(false);
      },
      (error) => {
        console.log(error);
        setIsCapturingLocation(false);
        Alert.alert('Error', 'Could not get your location. Please ensure GPS is enabled.');
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 
      }
    );
  };

  const handleTakePhoto = () => {
    if (!currentLocation) {
      Alert.alert(
        'Location Required', 
        'Please capture your location first to report an issue',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Location', onPress: getCurrentLocation },
        ]
      );
      return;
    }

    // For now, simulate camera capture
    // TODO: Implement actual camera integration
    const mockImageUri = 'https://via.placeholder.com/400x600/FF6B35/FFFFFF?text=Infrastructure+Issue';
    
    navigation.navigate('PhotoPreview', {
      imageUri: mockImageUri,
      location: currentLocation,
    });
  };

  const handlePickFromGallery = () => {
    if (!currentLocation) {
      Alert.alert('Location Required', 'Please capture your location first');
      return;
    }

    // TODO: Implement gallery picker
    Alert.alert('Coming Soon', 'Gallery picker will be implemented in the next update');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report Infrastructure Issue</Text>
        <Text style={styles.headerSubtitle}>
          Take a photo of the problem to get started
        </Text>
      </View>

      {/* Location Status */}
      <View style={styles.locationContainer}>
        <View style={styles.locationHeader}>
          <Icon 
            name="location-on" 
            size={24} 
            color={currentLocation ? "#4CAF50" : "#FFA726"} 
          />
          <Text style={styles.locationTitle}>
            {currentLocation ? 'Location Captured' : 'Location Required'}
          </Text>
        </View>
        
        {currentLocation ? (
          <Text style={styles.locationText}>
            📍 Lat: {currentLocation.latitude.toFixed(6)}, 
            Lng: {currentLocation.longitude.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.locationText}>
            Tap "Get Location" to capture your current position
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.locationButton,
            currentLocation && styles.locationButtonSuccess,
            isCapturingLocation && styles.locationButtonDisabled,
          ]}
          onPress={getCurrentLocation}
          disabled={isCapturingLocation}
        >
          <Icon 
            name={currentLocation ? "check-circle" : "my-location"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.locationButtonText}>
            {isCapturingLocation 
              ? 'Getting Location...' 
              : currentLocation 
                ? 'Location Captured' 
                : 'Get Location'
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera Area */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPreview}>
          <Icon name="photo-camera" size={100} color="#ccc" />
          <Text style={styles.cameraText}>Camera Preview</Text>
          <Text style={styles.cameraSubtext}>
            Point your camera at the infrastructure issue
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handlePickFromGallery}
        >
          <Icon name="photo-library" size={24} color="#FF6B35" />
          <Text style={styles.galleryButtonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.captureButton,
            !currentLocation && styles.captureButtonDisabled,
          ]}
          onPress={handleTakePhoto}
          disabled={!currentLocation}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpButton}>
          <Icon name="help-outline" size={24} color="#FF6B35" />
          <Text style={styles.helpButtonText}>Help</Text>
        </TouchableOpacity>
      </View>

      {/* Issue Types Guide */}
      <View style={styles.guideContainer}>
        <Text style={styles.guideTitle}>What can you report?</Text>
        <View style={styles.guideItems}>
          <View style={styles.guideItem}>
            <Icon name="build" size={16} color="#FF6B35" />
            <Text style={styles.guideItemText}>Potholes</Text>
          </View>
          <View style={styles.guideItem}>
            <Icon name="delete" size={16} color="#FF6B35" />
            <Text style={styles.guideItemText}>Garbage</Text>
          </View>
          <View style={styles.guideItem}>
            <Icon name="lightbulb-outline" size={16} color="#FF6B35" />
            <Text style={styles.guideItemText}>Street Lights</Text>
          </View>
          <View style={styles.guideItem}>
            <Icon name="road" size={16} color="#FF6B35" />
            <Text style={styles.guideItemText}>Damaged Roads</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF6B35',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  locationContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  locationButton: {
    backgroundColor: '#FFA726',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  locationButtonDisabled: {
    backgroundColor: '#ccc',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    marginTop: 0,
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: {
    color: '#ccc',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  cameraSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  galleryButton: {
    alignItems: 'center',
  },
  galleryButtonText: {
    color: '#FF6B35',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  captureButtonDisabled: {
    backgroundColor: '#ccc',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  helpButton: {
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#FF6B35',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  guideContainer: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  guideItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  guideItemText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default CameraScreen;
