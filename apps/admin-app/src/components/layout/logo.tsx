
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
		<span
			className={`inline-flex flex-row items-center leading-none select-none ${className ?? ''}`}
			aria-label="TodoApp Logo"
		>
			<span className={`${textSize} font-bold text-primary`}>Todo</span>
			<span className={`${textSize} font-bold text-secondary`}>App</span>
		</span>
	);
}
