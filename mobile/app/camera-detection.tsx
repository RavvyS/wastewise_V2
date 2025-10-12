import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { GeminiService } from '../utils/gemini';

const { width, height } = Dimensions.get('window');

interface DetectionResult {
  detectedSymbol?: string;
  recyclingCode?: string;
  materialType?: string;
  disposalInstructions?: string;
  confidence?: number;
  error?: string;
}

export default function CameraDetectionScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Request permissions on mount
    if (!permission?.granted) {
      requestPermission();
    }
    if (!mediaPermission?.granted) {
      requestMediaPermission();
    }
  }, []);

  if (!permission) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color="#ccc" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to detect recycling symbols on your items.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

    const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setIsAnalyzing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3, // Reduce quality to prevent PayloadTooLarge
        base64: true,
        exif: false,
      });

      setCapturedImage(photo);

      // Convert to base64 for Gemini API
      const response = await GeminiService.detectRecycleSymbol(photo.base64 || '');
      
      if (response.error) {
        // Show detailed feedback like the older version
        const message = response.error.includes('Detection failed') ? 
          'No recycling symbol found. Try positioning the camera closer to the ♻️ symbol with better lighting.' :
          response.error;
          
        Alert.alert(
          'No Recycling Symbol Found',
          message,
          [
            { text: 'Tips', onPress: showDetectionTips },
            { text: 'Try Again', onPress: resetCamera }
          ]
        );
      } else {
        setDetectionResult(response);
        setShowResult(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Detection Error', 
        'Failed to analyze image. Make sure you have good lighting and the recycling symbol is clearly visible.',
        [{ text: 'Try Again', onPress: resetCamera }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showDetectionTips = () => {
    Alert.alert(
      'Better Detection Tips',
      '🔍 What to look for:\n• Triangular ♻️ symbol with number 1-7 inside\n• Usually found on bottom of containers\n\n💡 For better results:\n• Ensure good, even lighting\n• Move closer to fill the frame\n• Hold camera steady\n• Clean dirty or scratched surfaces\n• Try different angles if symbol is unclear',
      [
        { text: 'Got it!', onPress: resetCamera },
        { text: 'Try Again', onPress: resetCamera }
      ]
    );
  };

  const resetCamera = () => {
    setDetectionResult(null);
    setShowResult(false);
    setIsAnalyzing(false);
  };

  const takePicture = capturePhoto;

  const closeResult = () => {
    setShowResult(false);
    setDetectionResult(null);
  };

  const renderResult = () => {
    if (!detectionResult) return null;

    if (detectionResult.error) {
      return (
        <View style={styles.resultContainer}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF5722" />
            <Text style={styles.errorTitle}>Detection Failed</Text>
            <Text style={styles.errorText}>
              {detectionResult.error}
            </Text>
            <Text style={styles.errorHint}>
              Try taking a clearer photo with better lighting, focusing on the recycling symbol.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.resultContainer} contentContainerStyle={styles.resultContent}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
          <Text style={styles.successTitle}>Symbol Detected!</Text>
          
          {detectionResult.detectedSymbol && (
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Detected Symbol:</Text>
              <Text style={styles.resultValue}>{detectionResult.detectedSymbol}</Text>
            </View>
          )}
          
          {detectionResult.recyclingCode && (
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Recycling Code:</Text>
              <Text style={styles.resultValue}>{detectionResult.recyclingCode}</Text>
            </View>
          )}
          
          {detectionResult.materialType && (
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Material Type:</Text>
              <Text style={styles.resultValue}>{detectionResult.materialType}</Text>
            </View>
          )}
          
          {detectionResult.disposalInstructions && (
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Disposal Instructions:</Text>
              <Text style={styles.instructionsText}>{detectionResult.disposalInstructions}</Text>
            </View>
          )}
          
          {detectionResult.confidence && (
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>
                Confidence: {Math.round(detectionResult.confidence * 100)}%
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recycle Symbol Detection</Text>
        <TouchableOpacity style={styles.headerButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* Camera Overlay */}
          <View style={styles.overlay}>
            <View style={styles.topOverlay}>
              <Text style={styles.instructionText}>
                Point your camera at a recycling symbol
              </Text>
            </View>
            
            <View style={styles.centerOverlay}>
              <View style={styles.focusFrame} />
            </View>
            
            <View style={styles.bottomOverlay}>
              {/* Tips Button */}
              <TouchableOpacity 
                style={styles.tipButton} 
                onPress={showDetectionTips}
              >
                <Text style={styles.tipButtonText}>💡 Tips</Text>
              </TouchableOpacity>
              
              {/* Capture Button */}
              <TouchableOpacity
                style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
            <Text style={styles.loadingSubtext}>Detecting recycling symbols</Text>
          </View>
        </View>
      )}

      {/* Result Modal */}
      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
        onRequestClose={closeResult}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detection Result</Text>
              <TouchableOpacity onPress={closeResult}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {renderResult()}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.tryAgainButton} onPress={closeResult}>
                <Text style={styles.tryAgainText}>Take Another Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF5722',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  centerOverlay: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    backgroundColor: '#999',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultContent: {
    paddingBottom: 20,
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
    marginBottom: 20,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultSection: {
    width: '100%',
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  confidenceContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
  },
  confidenceText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tryAgainButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  tryAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 15,
    // Ensure minimum touch target
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // Better visual feedback
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tipButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});