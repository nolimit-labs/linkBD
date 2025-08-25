
interface LogoProps {
	className?: string;
}

/**
 * Logo component for displaying the LinkBD logo.
 * Uses Tailwind classes for sizing. Default size is h-10 w-10.
 * Pass custom Tailwind classes via className to override.
 */
export function Logo({ className = "h-10 w-10" }: LogoProps) {
	return (
		<img
			src='/logo.svg'
			alt="LinkBD Logo"
			className={className}
		/>
	);
}
