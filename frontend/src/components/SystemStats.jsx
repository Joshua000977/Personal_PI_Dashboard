import StatCard from "./StatCard";
import "./SystemStats.css";
import { useSettings } from "../context/SettingsContext";
import SettingsPage from "../pages/SettingsPage";

function SystemStats({ systemData, systemStatus }) {
  const {
    temperature,
    temperatureProgress,
    temperatureDetail,
    temperatureVariant,
  } = systemStatus ?? {};

  const systemCards = [
    {
      title: "CPU Usage",
      value: systemData ? `${systemData.cpu.usage_percent.toFixed(0)}%` : "--%",
      detail: systemData
        ? `${systemData.cpu.cores} logical cores`
        : "Loading system data",
      icon: "CPU",
      progress: systemData?.cpu.usage_percent ?? 0,
    },
    {
      title: "Memory",
      value: systemData ? `${systemData.memory.used_gb} GB` : "-- GB",
      detail: systemData
        ? `of ${systemData.memory.total_gb} GB used`
        : "Loading system data",
      icon: "RAM",
      progress: systemData?.memory.usage_percent ?? 0,
    },
    {
      title: "Temperature",
      value: temperature == null ? "--°C" : `${temperature}°C`,
      detail: temperatureDetail,
      icon: "TEMP",
      progress: temperatureProgress,
      variant: temperatureVariant,
    },
    {
      title: "Storage",
      value: systemData ? `${systemData.storage.used_gb} GB` : "-- GB",
      detail: systemData
        ? `of ${systemData.storage.total_gb} GB used`
        : "Loading system data",
      icon: "SSD",
      progress: systemData?.storage.usage_percent ?? 0,
    },
  ];

  return (
    <section className="system-stats-grid">
      {systemCards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </section>
  );
}

export default SystemStats;
