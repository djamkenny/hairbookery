
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "text" | "pills";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (variant === "pills") {
    return (
      <ToggleGroup 
        type="single" 
        value={theme}
        onValueChange={(value) => {
          if (value) setTheme(value as "light" | "dark");
        }}
        className={cn("border rounded-full", className)}
      >
        <ToggleGroupItem value="light" className="rounded-l-full px-3">
          <Sun className="h-4 w-4 mr-1" />
          Light
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" className="rounded-r-full px-3">
          <Moon className="h-4 w-4 mr-1" />
          Dark
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

  if (variant === "text") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className={className}
      >
        {theme === "light" ? (
          <><Moon className="h-4 w-4 mr-1" /> Dark Mode</>
        ) : (
          <><Sun className="h-4 w-4 mr-1" /> Light Mode</>
        )}
      </Button>
    );
  }

  // Default: icon only
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={className}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
