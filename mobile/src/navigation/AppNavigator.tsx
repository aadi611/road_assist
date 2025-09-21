import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import AuthScreen from '../screens/AuthScreen';
import CameraScreen from '../screens/CameraScreen';
import PhotoPreviewScreen from '../screens/PhotoPreviewScreen';
import ReportStatusScreen from '../screens/ReportStatusScreen';
import ReportsHistoryScreen from '../screens/ReportsHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PhotoPreview: {
    imageUri: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  ReportStatus: {
    reportId: string;
  };
};

export type MainTabParamList = {
  Camera: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Camera':
              iconName = 'photo-camera';
              break;
            case 'Reports':
              iconName = 'list';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#FF6B35',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{
          title: 'Report Issue',
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsHistoryScreen}
        options={{
          title: 'My Reports',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  // TODO: Add authentication state check here
  const isAuthenticated = false; // This should come from Redux store

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="PhotoPreview" 
            component={PhotoPreviewScreen}
            options={{
              headerShown: true,
              title: 'Review Photo',
              headerStyle: { backgroundColor: '#FF6B35' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen 
            name="ReportStatus" 
            component={ReportStatusScreen}
            options={{
              headerShown: true,
              title: 'Report Status',
              headerStyle: { backgroundColor: '#FF6B35' },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
