import { Expense } from '@/hooks/useExpenses';

export const generateInsight = (expenses: Expense[]): string => {
  if (expenses.length === 0) {
    return "Start tracking your expenses to see insights! 📊";
  }

  const latestExpense = expenses[0];
  const last7Days = expenses.filter(
    (exp) => Date.now() - exp.timestamp < 7 * 24 * 60 * 60 * 1000
  );

  // Mood-based insights
  const moodCounts = expenses.reduce((acc, exp) => {
    acc[exp.mood] = (acc[exp.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  if (dominantMood && dominantMood[1] > 3) {
    if (dominantMood[0] === 'Bored') {
      return "You tend to spend more when bored. Try a free hobby! 🎨";
    }
    if (dominantMood[0] === 'Stressed') {
      return "Stressed spending detected. Take a deep breath first! 🧘";
    }
    if (dominantMood[0] === 'Happy') {
      return "You celebrate with purchases! Balance is key 🎉";
    }
  }

  // Category-based insights
  const categoryCounts = last7Days.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  if (topCategory && last7Days.length > 3) {
    return `Most of your spending this week was on ${topCategory[0].toLowerCase()}. 🍔`;
  }

  // Impulse detection from notes
  const impulseWords = ['craving', 'wanted', 'impulse', 'saw', 'treat'];
  const hasImpulse = expenses.some((exp) =>
    impulseWords.some((word) => exp.note.toLowerCase().includes(word))
  );

  if (hasImpulse) {
    return "Spotted some impulse purchases. Sleep on it next time! 💭";
  }

  // Positive reinforcement
  const today = new Date().toDateString();
  const todayExpenses = expenses.filter((exp) => new Date(exp.date).toDateString() === today);
  
  if (todayExpenses.length === 1 && todayExpenses[0].amount < 20) {
    return "Light spending day! Keep it up 🌟";
  }

  // Streak detection
  const last3Days = Array.from({ length: 3 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  });

  const moderateDays = last3Days.filter((day) => {
    const dayExpenses = expenses.filter((exp) => new Date(exp.date).toDateString() === day);
    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return total < 50;
  });

  if (moderateDays.length === 3) {
    return "Three mindful spending days in a row! 🎯";
  }

  // Default encouragement
  const encouragements = [
    "Small cuts lead to big savings 💪",
    "Every penny tracked is a penny earned 🪙",
    "You're building better money habits! 🌱",
    "Awareness is the first step to change 👀",
    "Keep tracking, you're doing great! ⭐",
  ];

  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

export const getMotivationalMessage = (): string => {
  const messages = [
    "Small cuts lead to big savings 💪",
    "Try a no-spend day challenge! 🎯",
    "You're improving your habits one day at a time 🌟",
    "Mindful spending leads to mindful living 🧘",
    "Track today, thank yourself tomorrow 📈",
    "Financial wellness starts with awareness 💡",
    "Every dollar has a story — make it count 📖",
    "Progress over perfection! 🎨",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};
