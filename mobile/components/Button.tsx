import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'

interface ButtonProps {
  onPress: () => void
  title: string
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#4F46E5', color: 'white' }
      case 'secondary':
        return { backgroundColor: '#6B7280', color: 'white' }
      case 'outline':
        return { backgroundColor: 'transparent', color: '#4F46E5', borderWidth: 2, borderColor: '#4F46E5' }
      case 'danger':
        return { backgroundColor: '#EF4444', color: 'white' }
      default:
        return { backgroundColor: '#4F46E5', color: 'white' }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 }
      case 'md':
        return { paddingHorizontal: 24, paddingVertical: 12, fontSize: 16 }
      case 'lg':
        return { paddingHorizontal: 32, paddingVertical: 16, fontSize: 18 }
      default:
        return { paddingHorizontal: 24, paddingVertical: 12, fontSize: 16 }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          opacity: disabled ? 0.5 : 1,
        },
        variantStyles.borderWidth && { borderWidth: variantStyles.borderWidth, borderColor: variantStyles.borderColor },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.color} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            { color: variantStyles.color, fontSize: sizeStyles.fontSize },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    fontWeight: '600',
  },
})
