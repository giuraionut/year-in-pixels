type ThemeColors = "Zinc" | "Rose" | "Blue" | "Green" | "Orange" | undefined

type ThemeContextParams = {
    themeColor: ThemeColors;
    setThemeColor: (color: ThemeColors) => void;
    customHue: number | undefined;
    setCustomHue: (hue: number | undefined) => void;
}

