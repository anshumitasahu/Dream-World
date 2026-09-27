import type { TimeOfDay, WeatherKind } from './weatherRegistry'
import Clear from './Clear'
import Forest from './Forest'
import Rain from './Rain'
import Snow from './Snow'
import Desert from './Desert'
import Wind from './Wind'

export default function Weather({ weather, time = 'day' }: { weather: WeatherKind; time?: TimeOfDay }) {
  switch (weather) {
    case 'clear':
      return <Clear time={time} />
    case 'wind':
      return <Wind />
    case 'rain':
      return <Rain />
    case 'snow':
      return <Snow />
    case 'forest':
      return <Forest time={time} />
    case 'desert':
      return <Desert />
    default:
      return null
  }
}
