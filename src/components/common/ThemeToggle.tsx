// themetoggle.tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useTheme } from "../../context/ThemeProvider"
import { type ComponentPropsWithoutRef } from "react"; // Import this

// Define props for ThemeToggle, extending Button's props to include className
// This allows ThemeToggle to accept any prop that your Button component accepts, including 'className'
type ThemeToggleProps = ComponentPropsWithoutRef<typeof Button>;

export default function ThemeToggle({ className, ...props }: ThemeToggleProps) { // Destructure className and rest of props
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className} // Apply the className prop here
      {...props} // Pass any other props down to the Button component
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}