import {
    createContext,
    useContext,
    useState,
  } from "react";
  
  
  const SettingsContext = createContext(null);
  
  const STORAGE_KEY = "personal-pi-dashboard-settings";
  
  
  export const DEFAULT_SETTINGS = {
    systemRefreshInterval: 3000,
    storageRefreshInterval: 5000,
    temperatureWarningLimit: 70,
    weatherLocationMode: "manual",
    weatherLocationName:
      "Straßburg, Kärnten, AT",
  };
  
  
  function loadStoredSettings() {
    try {
      const savedSettings =
        localStorage.getItem(STORAGE_KEY);
  
      if (!savedSettings) {
        return { ...DEFAULT_SETTINGS };
      }
  
      const parsedSettings =
        JSON.parse(savedSettings);
  
      return {
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
      };
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