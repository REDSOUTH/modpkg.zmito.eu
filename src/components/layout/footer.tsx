import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "react-i18next";
import "flag-icons/css/flag-icons.min.css";

const LANGUAGES = [
  { code: "en", label: "English", flag: "fi fi-us" },
  { code: "es", label: "Español", flag: "fi fi-es" },
  { code: "pt", label: "Português", flag: "fi fi-br" },
  { code: "fr", label: "Français", flag: "fi fi-fr" },
  { code: "de", label: "Deutsch", flag: "fi fi-de" },
];

export default function Footer() {
  const { i18n, t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language || "en";

  return (
    <footer className="py-8 border-t border-border bg-background text-sm text-muted-foreground transition-colors duration-200">
      <div className="max-w-[1920px] mx-auto w-full px-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        
        {/* Left side: Logo, Copyright & Links */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <a
            href="https://redsouth.zmito.eu/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <img src="/redsouth/banner.svg" alt="REDSOUTH Studio" className="h-12 w-auto select-none" draggable="false" />
          </a>
          
          <div className="text-center md:text-left">
            © {new Date().getFullYear()} REDSOUTH Studio. {t("footer.rights")}
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-muted-foreground/80 mt-3">
            <a
              href="https://redsouth.zmito.eu/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.terms")}
            </a>
            <a
              href="https://redsouth.zmito.eu/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.privacy")}
            </a>
            <a
              href="https://redsouth.zmito.eu/legal/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.cookies")}
            </a>
            <a
              href="https://redsouth.zmito.eu/legal/trademarks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("footer.trademarks")}
            </a>
          </div>
        </div>
        
        {/* Right side: Theme & Language Switchers */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setTheme("light")}
                className={`cursor-pointer ${theme === 'light' ? 'bg-accent/50' : ''}`}
              >
                <Sun className="h-4 w-4 mr-2" /> {t("footer.theme.light")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("dark")}
                className={`cursor-pointer ${theme === 'dark' ? 'bg-accent/50' : ''}`}
              >
                <Moon className="h-4 w-4 mr-2" /> {t("footer.theme.dark")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("system")}
                className={`cursor-pointer ${theme === 'system' ? 'bg-accent/50' : ''}`}
              >
                <Laptop className="h-4 w-4 mr-2" /> {t("footer.theme.system")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 px-3 cursor-pointer text-muted-foreground hover:text-foreground">
                <Globe className="h-4 w-4" />
                <span>{LANGUAGES.find((l) => currentLang.startsWith(l.code))?.label || 'English'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[140px]">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`cursor-pointer ${currentLang.startsWith(lang.code) ? 'bg-accent/50 font-medium' : ''}`}
                >
                  <span className={`${lang.flag} text-base rounded-[2px] overflow-hidden mr-2`}></span> {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
      </div>
    </footer>
  );
}
