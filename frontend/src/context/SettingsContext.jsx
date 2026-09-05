import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


const SettingsContext = createContext(null);

const STORAGE_KEY = "personal-pi-dashboard-settings";


export const DEFAULT_SETTINGS = {
  theme: "dark",
  systemRefreshInterval: 3000,
  storageRefreshInterval: 5000,
  temperatureWarningLimit: 70,
  weatherLocationMode: "manual",
  weatherLocationName:
    "Straßburg, Kärnten, AT",
};

const SUPPORTED_THEMES = new Set(["dark", "light", "system"]);


function getResolvedTheme(theme) {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}


function loadStoredSettings() {
  try {
    const savedSettings =
      localStorage.getItem(STORAGE_KEY);

    if (!savedSettings) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsedSettings =
      JSON.parse(savedSettings);

    const nextSettings = {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
    };

    if (!SUPPORTED_THEMES.has(nextSettings.theme)) {
      nextSettings.theme = DEFAULT_SETTINGS.theme;
    }

    return nextSettings;
  } catch (error) {
    console.error(
      "Could not load dashboard settings:",
      error,
    );

    return { ...DEFAULT_SETTINGS };
  }
}


export function SettingsProvider({ children }) {
  const [settings, setSettings] =
    useState(loadStoredSettings);

  useEffect(() => {
    const colorSchemeQuery = window.matchMedia(
      "(prefers-color-scheme: light)",
    );

    function applyTheme() {
      const resolvedTheme = getResolvedTheme(settings.theme);

      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.dataset.themePreference = settings.theme;
    }

    applyTheme();

    if (settings.theme !== "system") {
      return undefined;
    }

    colorSchemeQuery.addEventListener("change", applyTheme);

    return () => {
      colorSchemeQuery.removeEventListener("change", applyTheme);
    };
  }, [settings.theme]);


  function updateSetting(settingName, newValue) {
    setSettings((currentSettings) => {
      const updatedSettings = {
        ...currentSettings,
        [settingName]: newValue,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedSettings),
      );

      return updatedSettings;
    });
  }


  function resetSettings() {
    localStorage.removeItem(STORAGE_KEY);

    setSettings({
      ...DEFAULT_SETTINGS,
    });
  }


  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}


export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider.",
    );
  }

  return context;
}
