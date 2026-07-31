export function getSystemStatus({
    systemData,
    backendOnline,
    temperatureWarningLimit,
  }) {
    const temperature =
      systemData?.cpu?.temperature_celsius ?? null;
  
    const temperatureCriticalLimit = Math.min(
      temperatureWarningLimit + 10,
      85,
    );
  
    const temperatureProgress =
      temperature == null
        ? 0
        : Math.min((temperature / 85) * 100, 100);
  
    let temperatureDetail =
      "Loading temperature";
  
    let temperatureVariant = "default";
  
    if (temperature != null) {
      if (temperature >= temperatureCriticalLimit) {
        temperatureDetail =
          "System temperature very high";
  
        temperatureVariant = "critical";
      } else if (
        temperature >= temperatureWarningLimit
      ) {
        temperatureDetail =
          "System is running warm";
  
        temperatureVariant = "warning";
      } else {
        temperatureDetail =
          "System temperature normal";
  
        temperatureVariant = "healthy";
      }
    }
  
    let dashboardStatus = {
      text: "Checking system",
      variant: "loading",
    };
  
    if (!backendOnline) {
      dashboardStatus = {
        text: "Backend offline",
        variant: "critical",
      };
    } else if (temperatureVariant === "critical") {
      dashboardStatus = {
        text: "System hot",
        variant: "critical",
      };
    } else if (
      systemData?.health?.state === "warning"
    ) {
      dashboardStatus = {
        text: "System warning",
        variant: "warning",
      };
    } else if (temperatureVariant === "warning") {
      dashboardStatus = {
        text: "System running warm",
        variant: "warning",
      };
    } else {
      dashboardStatus = {
        text: "All systems operational",
        variant: "healthy",
      };
    }
  
    return {
      temperature,
      temperatureProgress,
      temperatureDetail,
      temperatureVariant,
      temperatureCriticalLimit,
      dashboardStatus,
    };
  }