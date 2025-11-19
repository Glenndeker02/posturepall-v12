import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import * as Crypto from 'expo-crypto'
import { LinearGradient } from 'expo-linear-gradient'
import apiService from '../services/api'
import socketService from '../services/socket'
import { useAppStore } from '../store'

export default function PairingScreen() {
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const { setUser, setDeviceId, setAuthenticated } = useAppStore()

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)

    try {
      // Generate device ID
      const deviceId = Crypto.randomUUID()

      // Pair with backend
      const response = await apiService.pairDevice(data, deviceId)

      if (response.success) {
        // Update store
        setUser(response.user)
        setDeviceId(deviceId)
        setAuthenticated(true)

        // Connect to WebSocket
        socketService.connect(response.user.id, deviceId)

        Alert.alert('Success', 'Device paired successfully!', [
          { text: 'OK', onPress: () => router.replace('/') },
        ])
      } else {
        throw new Error('Pairing failed')
      }
    } catch (error) {
      console.error('Pairing error:', error)
      Alert.alert('Error', 'Failed to pair device. Please try again.')
      setScanned(false)
    }
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.gradient}
        >
          <View style={styles.centeredContent}>
            <Text style={styles.title}>Camera Permission Required</Text>
            <Text style={styles.subtitle}>
              We need camera access to scan the QR code from your computer
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Scan QR Code</Text>
            <Text style={styles.instructionsText}>
              Point your camera at the QR code on your computer screen
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerTR: {
    position: 'absolute',
    top: '30%',
    right: '15%',
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  cornerBL: {
    position: 'absolute',
    bottom: '30%',
    left: '15%',
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerBR: {
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  instructions: {
    padding: 24,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
})
