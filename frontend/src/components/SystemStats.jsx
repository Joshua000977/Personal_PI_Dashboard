import StatCard from "./StatCard";
import "./SystemStats.css";


function SystemStats({ systemData }) {
  const temperature = systemData?.cpu.temperature_celsius;

  const temperatureProgress =
    temperature == null
      ? 0
      : Math.min((temperature / 85) * 100, 100);

  let temperatureDetail = "Loading temperature";

  if (temperature != null) {
    if (temperature < 70) {
      temperatureDetail = "System temperature normal";
    } else if (temperature < 80) {
      temperatureDetail = "System is running warm";
    } else {
      temperatureDetail = "System temperature very high";
    }
  }

  const systemCards = [
    {
      title: "CPU Usage",
      value: systemData
        ? `${systemData.cpu.usage_percent.toFixed(0)}%`
        : "--%",
      detail: systemData
        ? `${systemData.cpu.cores} logical cores`
        : "Loading system data",
      icon: "CPU",
      progress: systemData?.cpu.usage_percent ?? 0,
    },
    {
      title: "Memory",
      value: systemData
        ? `${systemData.memory.used_gb} GB`
        : "-- GB",
      detail: systemData
        ? `of ${systemData.memory.total_gb} GB used`
        : "Loading system data",
      icon: "RAM",
      progress: systemData?.memory.usage_percent ?? 0,
    },
    {
      title: "Temperature",
      value:
        temperature == null
          ? "--°C"
          : `${temperature}°C`,
      detail: temperatureDetail,
      icon: "TEMP",
      progress: temperatureProgress,
    },
    {
      title: "Storage",
      value: systemData
        ? `${systemData.storage.used_gb} GB`
        : "-- GB",
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