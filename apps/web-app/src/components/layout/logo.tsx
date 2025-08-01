
// LogoProps now accepts height and width instead of textSize
interface LogoProps {
	className?: string;
	height?: number | string;
	width?: number | string;
	priority?: boolean;
}

/**
 * Logo component for displaying the LinkBD logo.
 * Accepts optional height and width props to control the logo size.
 * - height/width can be a number (pixels) or string (e.g., "2rem", "40px").
 * - className allows for additional styling.
 */
export function Logo({ className, height = 40, width = 40 }: LogoProps) {
	return (
		<img
			src='/logo.svg'
			alt="LinkBD Logo"
			height={height}
			width={width}
			className={className ?? ''}
			style={{ height, width }}
		/>
	);
}
