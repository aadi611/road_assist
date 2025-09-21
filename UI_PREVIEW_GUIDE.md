# CivicReport Mobile App UI Guide

## 📱 How to See the UI

### Quick Setup for UI Preview

1. **Install Dependencies** (currently running):
   ```bash
   cd mobile
   npm install
   ```

2. **Start Metro Bundler**:
   ```bash
   npm run start
   ```

3. **Run on Device/Simulator**:
   
   **For Android:**
   ```bash
   npm run android
   ```
   
   **For iOS (Mac only):**
   ```bash
   npm run ios
   ```

   **Alternative - Use Expo Go App:**
   - Install Expo Go on your phone
   - Scan QR code from Metro bundler

## 🎨 UI Screens Overview

### 1. **Authentication Screen** (`AuthScreen.tsx`)
- **Clean phone authentication interface**
- Country code selector (+1, +91, etc.)
- Phone number input with formatting
- OTP verification with 6-digit input
- Professional styling with brand colors (#FF6B35)

### 2. **Camera Screen** (`CameraScreen.tsx`)
- **Main reporting interface**
- Live camera preview with overlay
- GPS location capture indicator
- Issue type quick selection buttons
- Professional camera controls
- Location permission handling

### 3. **Photo Preview Screen** (`PhotoPreviewScreen.tsx`)
- **Detailed issue classification**
- Large image preview with retake option
- Issue type selection (Pothole, Garbage, Street Light, etc.)
- Severity level picker with descriptions
- Additional notes text input
- GPS coordinates display
- Submit button with loading states

### 4. **Report Status Screen** (`ReportStatusScreen.tsx`)
- **Real-time processing status**
- Progress bar and percentage
- Step-by-step processing visualization:
  - ✅ Upload Complete
  - 🔄 AI Analysis (in progress)
  - ⏳ Location Mapping (pending)
  - ⏳ Official Identification (pending)
  - ⏳ Certificate Generation (pending)
  - ⏳ Social Media Posting (pending)
- Estimated completion times
- Success celebration with certificate download

### 5. **Navigation Structure** (`AppNavigator.tsx`)
- **Bottom tab navigation**:
  - 📷 Camera (main reporting)
  - 📋 Reports (history)
  - ⚙️ Settings
- Modal screens for photo preview and status
- Stack navigation with proper transitions

## 🎯 UI Design Features

### Visual Design
- **Modern Material Design** with custom brand colors
- **Orange accent color** (#FF6B35) throughout
- **Card-based layouts** with rounded corners
- **Consistent spacing** and typography
- **Professional icons** from MaterialIcons
- **Smooth animations** and transitions

### User Experience
- **Step-by-step guided flow**
- **Real-time feedback** for all actions
- **Clear progress indicators**
- **Helpful descriptive text**
- **Error handling** with user-friendly messages
- **Accessibility considerations**

### Interactive Elements
- **Touch-friendly buttons** (minimum 44pt)
- **Form validation** with visual feedback
- **Loading states** for all async operations
- **Swipe gestures** for navigation
- **Haptic feedback** on interactions

## 📱 Screen Flow

```
📱 App Launch
    ↓
🔐 Authentication (Phone + OTP)
    ↓
📷 Camera Screen (Main Interface)
    ↓
📋 Photo Preview (Issue Details)
    ↓
⏳ Processing Status (Real-time Updates)
    ↓
✅ Completion (Certificate Ready)
```

## 🎨 Color Scheme

- **Primary Orange**: `#FF6B35`
- **Success Green**: `#4CAF50`
- **Warning Amber**: `#FFA726`
- **Error Red**: `#F44336`
- **Background**: `#f8f9fa`
- **Cards**: `#ffffff`
- **Text Primary**: `#333333`
- **Text Secondary**: `#666666`

## 🚀 Next Steps

1. **Install dependencies** (in progress)
2. **Start the development server**
3. **Run on your device/simulator**
4. **See the beautiful UI in action!**

The UI is designed to be **production-ready** with professional styling, smooth animations, and excellent user experience!
