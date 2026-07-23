import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Courses", href: "#subjects" },
  { label: "Philosophy", href: "#philosophy" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border/40" role="banner">
      <nav className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group" onClick={(e) => {
          e.preventDefault();
          window.location.href = "/";
        }} aria-label="Funfinity Academy Home">
          <FunfinityIcon
            size="lg"
            className="transition-transform group-hover:scale-105 drop-shadow-lg"
          />
          <span className="font-display font-bold text-base sm:text-lg text-foreground hidden sm:inline">
            Fun<span className="text-gradient-brand">finity</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 sm:gap-6 md:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-lg hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
          </button>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth'} className="focus:outline-none focus:ring-2 focus:ring-primary h-11">
            Log In
          </Button>
          <Button variant="hero" size="default" onClick={() => window.location.href = '/auth'} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 h-11">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-3 hover:bg-secondary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full h-11" onClick={() => window.location.href = '/auth'}>
                  Log In
                </Button>
                <Button variant="hero" size="default" className="w-full h-11" onClick={() => window.location.href = '/auth'}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
