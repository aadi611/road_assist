import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PhotoPreviewScreenProps {
  route: {
    params: {
      imageUri: string;
      location: {
        latitude: number;
        longitude: number;
      };
    };
  };
  navigation: any;
}

const ISSUE_TYPES = [
  { id: 'pothole', label: 'Pothole', icon: 'build' },
  { id: 'garbage', label: 'Garbage', icon: 'delete' },
  { id: 'broken_streetlight', label: 'Broken Street Light', icon: 'lightbulb-outline' },
  { id: 'damaged_road', label: 'Damaged Road', icon: 'road' },
  { id: 'other', label: 'Other', icon: 'more-horiz' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low Priority', color: '#4CAF50', description: 'Minor issue, not urgent' },
  { id: 'medium', label: 'Medium Priority', color: '#FFA726', description: 'Noticeable problem' },
  { id: 'high', label: 'High Priority', color: '#FF5722', description: 'Needs attention soon' },
  { id: 'critical', label: 'Critical', color: '#F44336', description: 'Safety hazard!' },
];

const PhotoPreviewScreen: React.FC<PhotoPreviewScreenProps> = ({ route, navigation }) => {
  const { imageUri, location } = route.params;
  const [selectedIssueType, setSelectedIssueType] = useState('');
  const [selectedSeverity, setSeverSeverity] = useState('medium');
  const [userNotes, setUserNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedIssueType) {
      Alert.alert('Required', 'Please select the type of issue');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual API call
      console.log('Submitting report:', {
        imageUri,
        location,
        issueType: selectedIssueType,
        severity: selectedSeverity,
        notes: userNotes,
      });

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to status screen with mock report ID
      navigation.replace('ReportStatus', {
        reportId: 'mock-report-' + Date.now(),
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Icon name="camera-alt" size={20} color="#FF6B35" />
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>
        </View>

        {/* Location Info */}
        <View style={styles.locationContainer}>
          <View style={styles.sectionHeader}>
            <Icon name="location-on" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.locationText}>
            📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationSubtext}>
            Location will be used to identify relevant government officials
          </Text>
        </View>

        {/* Issue Type Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="category" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Issue Type *</Text>
          </View>
          <View style={styles.optionsContainer}>
            {ISSUE_TYPES.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={[
                  styles.optionCard,
                  selectedIssueType === issue.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedIssueType(issue.id)}
              >
                <Icon 
                  name={issue.icon} 
                  size={24} 
                  color={selectedIssueType === issue.id ? '#FF6B35' : '#666'} 
                />
                <Text 
                  style={[
                    styles.optionText,
                    selectedIssueType === issue.id && styles.optionTextSelected,
                  ]}
                >
                  {issue.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="warning" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Severity Level</Text>
          </View>
          <View style={styles.severityContainer}>
            {SEVERITY_LEVELS.map((severity) => (
              <TouchableOpacity
                key={severity.id}
                style={[
                  styles.severityCard,
                  selectedSeverity === severity.id && styles.severityCardSelected,
                  { borderLeftColor: severity.color },
                ]}
                onPress={() => setSeverSeverity(severity.id)}
              >
                <View style={styles.severityHeader}>
                  <Text 
                    style={[
                      styles.severityLabel,
                      selectedSeverity === severity.id && { color: severity.color },
                    ]}
                  >
                    {severity.label}
                  </Text>
                  {selectedSeverity === severity.id && (
                    <Icon name="check-circle" size={18} color={severity.color} />
                  )}
                </View>
                <Text style={styles.severityDescription}>{severity.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="note" size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Describe the issue in more detail..."
            value={userNotes}
            onChangeText={setUserNotes}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{userNotes.length}/500</Text>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedIssueType || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedIssueType || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Icon name="send" size={24} color="#fff" />
            )}
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.submitNote}>
            Your report will be analyzed by AI and forwarded to relevant authorities
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  locationSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  optionCard: {
    width: '48%',
    margin: 8,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF3F0',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  severityContainer: {
    gap: 12,
  },
  severityCard: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  severityCardSelected: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  severityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  severityDescription: {
    fontSize: 14,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  submitContainer: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});

export default PhotoPreviewScreen;
