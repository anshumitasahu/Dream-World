import type { WeatherKind } from './weatherRegistry';
import Rain from './Rain'

export default function Weather({ weather }: { weather: WeatherKind }) {
    switch (weather) {
        case 'rain':
            return <Rain />
        default:
            return null
    }
}