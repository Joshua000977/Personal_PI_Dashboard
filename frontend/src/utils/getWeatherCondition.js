function getWeatherCondition(weatherCode) {
  const code = Number(weatherCode);

  if (code === 0) {
    return {
      label: "Clear sky",
      theme: "sunny",
      icon: "☀️",
    };
  }

  if (code === 1) {
    return {
      label: "Mainly clear",
      theme: "sunny",
      icon: "☀️",
    };
  }

  if (code === 2) {
    return {
      label: "Partly cloudy",
      theme: "cloudy",
      icon: "⛅",
    };
  }

  if (code === 3) {
    return {
      label: "Overcast",
      theme: "cloudy",
      icon: "☁️",
    };
  }

  if (code === 45 || code === 48) {
    return {
      label: "Fog",
      theme: "foggy",
      icon: "🌫️",
    };
  }

  if (code >= 51 && code <= 57) {
    return {
      label: "Drizzle",
      theme: "drizzly",
      icon: "🌦️",
    };
  }

  if (code >= 61 && code <= 67) {
    return {
      label: "Rain",
      theme: "rainy",
      icon: "🌧️",
    };
  }

  if (code >= 71 && code <= 77) {
    return {
      label: "Snow",
      theme: "snowy",
      icon: "❄️",
    };
  }

  if (code >= 80 && code <= 82) {
    return {
      label: "Rain showers",
      theme: "rainy",
      icon: "🌧️",
    };
  }

  if (code === 85 || code === 86) {
    return {
      label: "Snow showers",
      theme: "snowy",
      icon: "🌨️",
    };
  }

  if (code >= 95 && code <= 99) {
    return {
      label: "Thunderstorm",
      theme: "stormy",
      icon: "⛈️",
    };
  }

  return {
    label: "Unknown weather",
    theme: "default",
    icon: "",
  };
}

export default getWeatherCondition;
