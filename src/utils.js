export function calculateResetTime(resetConfig) {
  const { type, time = '00:00', timezone = 'UTC' } = resetConfig;

  if (type === 'daily') {
    return getNextDailyResetTime(time, timezone);
  } else if (type === 'weekly') {
    const { option } = resetConfig;
    if (option === 'fixedDay') {
      const { dayOfWeek } = resetConfig;
      return getNextWeeklyResetTime(dayOfWeek, time, timezone);
    } else if (option === 'afterCompletion') {
      return getNextAfterCompletionResetTime();
    }
  } else if (type === 'monthly') {
    const { dayOfMonth } = resetConfig;
    return getNextMonthlyResetTime(dayOfMonth, time, timezone);
  } else {
    // Default to daily reset
    return getNextDailyResetTime(time, timezone);
  }
}

export function formatTimeRemaining(timeInMilliseconds) {
  const totalSeconds = Math.floor(timeInMilliseconds / 1000);

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

function getNextDailyResetTime(time, timezone) {
  const now = new Date();
  const resetTime = new Date();

  const [hours, minutes] = time.split(':').map(Number);

  resetTime.setUTCHours(hours, minutes, 0, 0);

  if (resetTime <= now) {
    // If reset time has already passed today, set to tomorrow
    resetTime.setUTCDate(resetTime.getUTCDate() + 1);
  }

  return resetTime.getTime();
}

function getNextWeeklyResetTime(dayOfWeek, time, timezone) {
  const now = new Date();

  const daysOfWeek = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDay = daysOfWeek[dayOfWeek];

  if (targetDay === undefined) {
    throw new Error(`Invalid dayOfWeek: ${dayOfWeek}`);
  }

  const resetTime = new Date();

  const [hours, minutes] = time.split(':').map(Number);
  resetTime.setUTCHours(hours, minutes, 0, 0);

  const currentDay = resetTime.getUTCDay();
  let daysUntilReset = (targetDay - currentDay + 7) % 7;

  if (daysUntilReset === 0 && resetTime <= now) {
    daysUntilReset = 7; // Next week
  }

  resetTime.setUTCDate(resetTime.getUTCDate() + daysUntilReset);

  return resetTime.getTime();
}

function getNextAfterCompletionResetTime() {
  const now = new Date();
  const resetTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return resetTime.getTime();
}

function getNextMonthlyResetTime(dayOfMonth, time, timezone) {
  const now = new Date();
  const resetTime = new Date();

  const [hours, minutes] = time.split(':').map(Number);
  resetTime.setUTCHours(hours, minutes, 0, 0);
  resetTime.setUTCDate(dayOfMonth);

  if (resetTime <= now) {
    // If reset time has already passed this month, set to next month
    resetTime.setUTCMonth(resetTime.getUTCMonth() + 1);
    resetTime.setUTCDate(dayOfMonth);
  }

  return resetTime.getTime();
}
