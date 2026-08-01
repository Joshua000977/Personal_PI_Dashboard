const warningRules = [
  {
    matches: (code) => code >= 95 && code <= 99,
    label: "Thunderstorm possible",
    theme: "stormy",
  },
  {
    matches: (code) => code === 85 || code === 86,
    label: "Snow showers possible",
    theme: "snowy",
  },
  {
    matches: (code) => code >= 80 && code <= 82,
    label: "Rain showers possible",
    theme: "rainy",
  },
  {
    matches: (code) => code >= 71 && code <= 77,
    label: "Snow possible",
    theme: "snowy",
  },
  {
    matches: (code) => code >= 61 && code <= 67,
    label: "Rain possible",
    theme: "rainy",
  },
];

function getSevereWeatherWarning(
  hourlyForecast,
  dayDate,
  dailyRainProbability
) {
  const daytimeHours = hourlyForecast.filter((hourData) => {
    const dateMatches = hourData.time.startsWith(`${dayDate}T`);

    const hour = Number(hourData.time.slice(11, 13));

    const isDaytime = hour >= 8 && hour <= 20;

    return dateMatches && isDaytime;
  });

  for (const rule of warningRules) {
    const matchingHours = daytimeHours.filter((hourData) => {
      const weatherCode = Number(hourData.weather_code);

      return rule.matches(weatherCode);
    });

    if (matchingHours.length === 0) {
      continue;
    }

    const precipitationProbabilities = matchingHours.map((hourData) =>
      Number(hourData.precipitation_probability_percent ?? 0)
    );

    const highestProbability = Math.max(...precipitationProbabilities);

    return {
      label: rule.label,
      theme: rule.theme,
      probabilityPercent: highestProbability,
    };
  }
  const highestRainProbability = Math.max(
    ...daytimeHours.map((hourData) =>
      Number(hourData.precipitation_probability_percent ?? 0)
    ),
    0
  );
  const warningProbability = Math.max(
    highestRainProbability,
    Number(dailyRainProbability ?? 0)
  );

  if (warningProbability >= 50) {
    return {
      label: "Rain possible",
      theme: "rainy",
      probabilityPercent: warningProbability,
    };
  }
  return null;
}

export default getSevereWeatherWarning;
