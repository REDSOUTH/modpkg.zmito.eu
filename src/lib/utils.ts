import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({
  override: {
    classGroups: {
      "outline-w": ["outline-0", "outline-1", "outline-2", "outline-4", "outline-8"],
      "outline-style": ["outline", "outline-dashed", "outline-dotted", "outline-double", "outline-none"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}

