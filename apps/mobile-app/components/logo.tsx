import { View } from 'react-native';
import LogoSvg from '~/assets/logo.svg';

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
}

// Logo component renders the SVG logo from assets
// Accepts optional className, width, and height props for styling
// Uses NativeWind for styling the container
export function Logo({ className, width = 120, height = 40 }: LogoProps) {
    return (
        <View
            className={`flex-row items-center justify-center ${className ?? ''}`}
            accessibilityLabel="App Logo"
            accessibilityRole="image"
        >
            <LogoSvg width={width} height={height} />
        </View>
    );
}
