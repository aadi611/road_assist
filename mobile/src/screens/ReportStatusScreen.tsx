import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ReportStatusScreenProps {
  route: {
    params: {
      reportId: string;
    };
  };
  navigation: any;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedTime?: string;
  completedAt?: string;
  error?: string;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'upload',
    title: 'Upload Complete',
    description: 'Image and location data received',
    status: 'completed',
    completedAt: '2 minutes ago',
  },
  {
    id: 'ai_analysis',
    title: 'AI Analysis',
    description: 'Analyzing image for infrastructure issues',
    status: 'processing',
    estimatedTime: '1-2 minutes',
  },
  {
    id: 'location_mapping',
    title: 'Location Mapping',
    description: 'Identifying relevant government jurisdiction',
    status: 'pending',
    estimatedTime: '30 seconds',
  },
  {
    id: 'official_identification',
    title: 'Official Identification',
    description: 'Finding responsible government officials',
    status: 'pending',
    estimatedTime: '1 minute',
  },
  {
    id: 'certificate_generation',
    title: 'Certificate Generation',
    description: 'Creating official complaint certificate',
    status: 'pending',
    estimatedTime: '30 seconds',
  },
  {
    id: 'social_posting',
    title: 'Social Media Posting',
    description: 'Publishing to Twitter with officials tagged',
    status: 'pending',
    estimatedTime: '30 seconds',
  },
];

const ReportStatusScreen: React.FC<ReportStatusScreenProps> = ({ route, navigation }) => {
  const { reportId } = route.params;
  const [steps, setSteps] = useState(PROCESSING_STEPS);
  const [currentStep, setCurrentStep] = useState(1);
  const [overallProgress, setOverallProgress] = useState(16.67); // 1/6 steps complete

  useEffect(() => {
    // Simulate processing steps
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length) {
          clearInterval(timer);
          return prev;
        }
        
        setSteps(currentSteps => {
          const updated = [...currentSteps];
          if (prev < updated.length) {
            updated[prev].status = 'completed';
            updated[prev].completedAt = 'Just now';
            if (prev + 1 < updated.length) {
              updated[prev + 1].status = 'processing';
            }
          }
          return updated;
        });

        setOverallProgress((prev + 1) / steps.length * 100);
        return prev + 1;
      });
    }, 3000); // Update every 3 seconds for demo

    return () => clearInterval(timer);
  }, []);

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <Icon name="check-circle" size={24} color="#4CAF50" />;
      case 'processing':
        return <ActivityIndicator size="small" color="#FF6B35" />;
      case 'failed':
        return <Icon name="error" size={24} color="#F44336" />;
      default:
        return <Icon name="radio-button-unchecked" size={24} color="#ddd" />;
    }
  };

  const getStepContainerStyle = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return [styles.stepContainer, styles.stepCompleted];
      case 'processing':
        return [styles.stepContainer, styles.stepProcessing];
      case 'failed':
        return [styles.stepContainer, styles.stepFailed];
      default:
        return styles.stepContainer;
    }
  };

  const handleGoToHistory = () => {
    navigation.navigate('ReportsHistory');
  };

  const handleShareCertificate = () => {
    Alert.alert(
      'Certificate Ready',
      'Your complaint certificate has been generated. Would you like to download it?',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Download', onPress: () => console.log('Download certificate') },
      ]
    );
  };

  const allCompleted = currentStep >= steps.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.reportInfo}>
            <Text style={styles.reportId}>Report #{reportId.slice(-8).toUpperCase()}</Text>
            <Text style={styles.reportDate}>
              Submitted: {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          {allCompleted && (
            <TouchableOpacity style={styles.shareButton} onPress={handleShareCertificate}>
              <Icon name="file-download" size={20} color="#FF6B35" />
            </TouchableOpacity>
          )}
        </View>

        {/* Overall Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Processing Status</Text>
            <Text style={styles.progressPercent}>{Math.round(overallProgress)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[styles.progressBar, { width: `${overallProgress}%` }]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {allCompleted 
              ? 'All processing complete! Your report has been submitted.'
              : 'Your report is being processed and will be submitted to relevant authorities.'
            }
          </Text>
        </View>

        {/* Processing Steps */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Processing Steps</Text>
          
          {steps.map((step, index) => (
            <View key={step.id} style={getStepContainerStyle(step)}>
              <View style={styles.stepIcon}>
                {getStepIcon(step)}
              </View>
              
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  {step.status === 'processing' && step.estimatedTime && (
                    <Text style={styles.estimatedTime}>~{step.estimatedTime}</Text>
                  )}
                  {step.completedAt && (
                    <Text style={styles.completedTime}>{step.completedAt}</Text>
                  )}
                </View>
                
                <Text style={styles.stepDescription}>{step.description}</Text>
                
                {step.error && (
                  <Text style={styles.stepError}>{step.error}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Completion Actions */}
        {allCompleted && (
          <View style={styles.actionsSection}>
            <View style={styles.completionBanner}>
              <Icon name="celebration" size={32} color="#4CAF50" />
              <Text style={styles.completionTitle}>Report Submitted Successfully!</Text>
              <Text style={styles.completionDescription}>
                Your complaint has been forwarded to the relevant authorities and posted on social media with officials tagged.
              </Text>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleShareCertificate}>
              <Icon name="file-download" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Download Certificate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={handleGoToHistory}
            >
              <Icon name="history" size={24} color="#FF6B35" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                View All Reports
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>What happens next?</Text>
          <View style={styles.helpItem}>
            <Icon name="check" size={16} color="#4CAF50" />
            <Text style={styles.helpText}>
              AI analysis identifies the specific infrastructure issue
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Icon name="check" size={16} color="#4CAF50" />
            <Text style={styles.helpText}>
              Relevant government officials are automatically identified
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Icon name="check" size={16} color="#4CAF50" />
            <Text style={styles.helpText}>
              A formal complaint certificate is generated
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Icon name="check" size={16} color="#4CAF50" />
            <Text style={styles.helpText}>
              Your report is posted on social media tagging officials
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },
  reportInfo: {
    flex: 1,
  },
  reportId: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF3F0',
  },
  progressSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepsSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  stepCompleted: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  stepProcessing: {
    backgroundColor: '#FFF3F0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  stepFailed: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  stepIcon: {
    marginRight: 16,
    paddingTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  estimatedTime: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  completedTime: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepError: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 4,
  },
  actionsSection: {
    padding: 20,
  },
  completionBanner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  completionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#FF6B35',
  },
  helpSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
    flex: 1,
  },
});

export default ReportStatusScreen;
