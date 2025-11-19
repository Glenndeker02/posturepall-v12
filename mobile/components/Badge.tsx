import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'

interface BadgeProps {
  text: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  style?: ViewStyle
  textStyle?: TextStyle
}

export default function Badge({
  text,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: '#D1FAE5', color: '#065F46' }
      case 'warning':
        return { backgroundColor: '#FEF3C7', color: '#92400E' }
      case 'danger':
        return { backgroundColor: '#FEE2E2', color: '#991B1B' }
      case 'info':
        return { backgroundColor: '#DBEAFE', color: '#1E40AF' }
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151' }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 }
      case 'md':
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 }
      case 'lg':
        return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 16 }
      default:
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: variantStyles.color, fontSize: sizeStyles.fontSize },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
  },
})
