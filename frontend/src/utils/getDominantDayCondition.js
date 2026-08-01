import getWeatherCondition from "./getWeatherCondition";

function getDominantDayCondition(
  hourlyForecast,
  dayDate,
) {
  const daytimeHours = hourlyForecast.filter(
    (hourData) => {
      const dateMatches =
        hourData.time.startsWith(`${dayDate}T`);

      const hour = Number(
        hourData.time.slice(11, 13),
      );

      const isDaytime =
        hour >= 8 && hour <= 20;

      return dateMatches && isDaytime;
    },
  );

  const conditionCounts = new Map();

  for (const hourData of daytimeHours) {
    const condition = getWeatherCondition(
      hourData.weather_code,
    );

    const conditionKey =
      `${condition.theme}:${condition.label}`;

    const existingEntry =
      conditionCounts.get(conditionKey);

    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      conditionCounts.set(
        conditionKey,
        {
          condition,
          count: 1,
        },
      );
    }
  }

  let dominantCondition = {
    label: "Unknown weather",
    theme: "default",
  };

  let highestCount = 0;

  for (const entry of conditionCounts.values()) {
    if (entry.count > highestCount) {
      highestCount = entry.count;
      dominantCondition = entry.condition;
    }
  }

  return dominantCondition;
}

export default getDominantDayCondition;