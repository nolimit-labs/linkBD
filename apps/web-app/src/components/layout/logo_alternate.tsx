
interface LogoProps {
	className?: string;
	textSize?: string;
	priority?: boolean;
}

// Logo component renders the app name "TodoApp" with "Todo" in primary color and "App" in secondary color.
// The words "Todo" and "App" are displayed side by side (horizontally), not stacked.
// Accepts optional className, width, height, and priority props for styling and accessibility.
export function Logo({ className, textSize = "text-2xl" }: LogoProps) {
	return (
		<img
			src='/logo.svg'
			alt="Todos App Logo"
			className={`${textSize} ${className ?? ''}`}
		/>
	);
}
