import { View, Dimensions, StyleSheet } from 'react-native'
import { LineChart, BarChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width

interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
    color?: (opacity: number) => string
    strokeWidth?: number
  }[]
}

interface ChartComponentProps {
  type: 'line' | 'bar'
  data: ChartData
  height?: number
  showLegend?: boolean
  color?: string
  bezier?: boolean
}

export default function ChartComponent({
  type,
  data,
  height = 220,
  showLegend = false,
  color = '#4F46E5',
  bezier = true,
}: ChartComponentProps) {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => color.replace(')', `, ${opacity})`).replace('#', 'rgba(').replace(/^rgba\(([^,]+)/, (_, hex) => {
      // Convert hex to rgb
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}`
    }),
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid lines
      stroke: '#E5E7EB',
      strokeWidth: 1,
    },
  }

  const chartStyle = {
    marginVertical: 8,
    borderRadius: 16,
  }

  const commonProps = {
    width: screenWidth - 32,
    height,
    chartConfig,
    style: chartStyle,
    withVerticalLabels: true,
    withHorizontalLabels: true,
    withVerticalLines: false,
    withHorizontalLines: true,
    withInnerLines: true,
    withOuterLines: false,
    fromZero: true,
  }

  return (
    <View style={styles.container}>
      {type === 'line' ? (
        <LineChart
          data={data}
          bezier={bezier}
          {...commonProps}
        />
      ) : (
        <BarChart
          data={data}
          {...commonProps}
          showValuesOnTopOfBars
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
})
