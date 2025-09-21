import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'switch' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false);

  const settingsItems: SettingsItem[] = [
    // Account Section
    {
      id: 'profile',
      title: 'Profile & Account',
      subtitle: 'Manage your account details',
      icon: 'account-circle',
      type: 'navigation',
      onPress: () => Alert.alert('Profile', 'Profile settings coming soon!'),
    },
    {
      id: 'phone',
      title: 'Phone Number',
      subtitle: '+1 (555) 123-4567',
      icon: 'phone',
      type: 'navigation',
      onPress: () => Alert.alert('Phone', 'Phone number verification coming soon!'),
    },
    
    // Privacy & Security Section
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Get notified about report status updates',
      icon: 'notifications',
      type: 'switch',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow app to access your location',
      icon: 'location-on',
      type: 'switch',
      value: locationEnabled,
      onToggle: setLocationEnabled,
    },
    {
      id: 'biometrics',
      title: 'Biometric Login',
      subtitle: 'Use fingerprint or face unlock',
      icon: 'fingerprint',
      type: 'switch',
      value: biometricsEnabled,
      onToggle: setBiometricsEnabled,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      icon: 'privacy-tip',
      type: 'navigation',
      onPress: () => Alert.alert('Privacy', 'Opening privacy policy...'),
    },
    
    // Data & Storage Section
    {
      id: 'data-usage',
      title: 'Data Usage',
      subtitle: 'View data consumption',
      icon: 'data-usage',
      type: 'navigation',
      onPress: () => Alert.alert('Data Usage', 'Data usage statistics coming soon!'),
    },
    {
      id: 'storage',
      title: 'Storage & Cache',
      subtitle: 'Manage app storage',
      icon: 'storage',
      type: 'navigation',
      onPress: () => Alert.alert('Storage', 'Storage management coming soon!'),
    },
    
    // Support Section
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help using the app',
      icon: 'help',
      type: 'navigation',
      onPress: () => Alert.alert('Help', 'Help center coming soon!'),
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve the app',
      icon: 'feedback',
      type: 'navigation',
      onPress: () => Alert.alert('Feedback', 'Feedback form coming soon!'),
    },
    {
      id: 'rate',
      title: 'Rate CivicReport',
      subtitle: 'Rate us on the app store',
      icon: 'star',
      type: 'navigation',
      onPress: () => Alert.alert('Rate App', 'Opening app store...'),
    },
    
    // About Section
    {
      id: 'version',
      title: 'App Version',
      subtitle: '1.0.0 (Build 1)',
      icon: 'info',
      type: 'info',
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'Read our terms of service',
      icon: 'gavel',
      type: 'navigation',
      onPress: () => Alert.alert('Terms', 'Opening terms of service...'),
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingsItem, item.type === 'info' && styles.settingsItemDisabled]}
        onPress={item.onPress}
        disabled={item.type === 'info'}
      >
        <View style={styles.settingsItemLeft}>
          <View style={styles.iconContainer}>
            <Icon name={item.icon} size={24} color="#FF6B35" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingsItemRight}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#e0e0e0', true: '#FFB899' }}
              thumbColor={item.value ? '#FF6B35' : '#fff'}
            />
          )}
          {item.type === 'navigation' && (
            <Icon name="chevron-right" size={24} color="#ccc" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your reports and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete account') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your CivicReport preferences</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon name="person" size={32} color="#FF6B35" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
            <Text style={styles.profileStats}>12 reports • 8 completed</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="edit" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {settingsItems.slice(0, 2).map(renderSettingsItem)}
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          {settingsItems.slice(2, 6).map(renderSettingsItem)}
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          {settingsItems.slice(6, 8).map(renderSettingsItem)}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {settingsItems.slice(8, 11).map(renderSettingsItem)}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {settingsItems.slice(11).map(renderSettingsItem)}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#FF6B35" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Icon name="delete-forever" size={24} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CivicReport v1.0.0{'\n'}
            Making civic reporting accessible to everyone
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileStats: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemDisabled: {
    opacity: 0.6,
  },
  settingsItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsItemRight: {
    marginLeft: 12,
  },
  actionsSection: {
    marginTop: 8,
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
    marginLeft: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F44336',
    marginLeft: 12,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SettingsScreen;
