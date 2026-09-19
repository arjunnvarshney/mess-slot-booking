import { MEALS } from "./utils.js";
const rotations = [
  [
    ["Aloo paratha", "Curd", "Seasonal fruit"],
    ["Rajma", "Steamed rice", "Roti", "Salad"],
    ["Vegetable sandwich", "Tea"],
    ["Paneer bhurji", "Dal tadka", "Roti", "Rice"],
  ],
  [
    ["Idli", "Sambar", "Coconut chutney"],
    ["Chole", "Jeera rice", "Roti", "Salad"],
    ["Samosa", "Tea"],
    ["Mixed vegetables", "Dal fry", "Roti", "Kheer"],
  ],
  [
    ["Poha", "Sprouts", "Seasonal fruit"],
    ["Kadhi pakora", "Rice", "Roti", "Salad"],
    ["Pav bhaji", "Tea"],
    ["Matar paneer", "Dal", "Roti", "Rice"],
  ],
  [
    ["Vegetable upma", "Chutney", "Banana"],
    ["Aloo gobi", "Dal", "Rice", "Roti"],
    ["Vegetable cutlet", "Tea"],
    ["Chana masala", "Jeera rice", "Roti", "Halwa"],
  ],
  [
    ["Poori", "Aloo sabzi", "Seasonal fruit"],
    ["Dal makhani", "Rice", "Roti", "Salad"],
    ["Corn chaat", "Tea"],
    ["Vegetable pulao", "Raita", "Dal"],
  ],
  [
    ["Dosa", "Sambar", "Chutney"],
    ["Palak paneer", "Dal", "Roti", "Rice"],
    ["Bread pakora", "Tea"],
    ["Aloo beans", "Rajma", "Roti", "Rice"],
  ],
  [
    ["Stuffed paratha", "Curd", "Banana"],
    ["Vegetable biryani", "Raita", "Salad"],
    ["Pasta", "Tea"],
    ["Shahi paneer", "Dal", "Roti", "Gulab jamun"],
  ],
];
export function weekDates(start) {
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(start + "T12:00:00Z");
    day.setUTCDate(day.getUTCDate() + offset);
    return day.toISOString().slice(0, 10);
  });
}
export function sampleMenu(date) {
  const dishes = rotations[new Date(date + "T12:00:00Z").getUTCDay()];
  return {
    date,
    sample: true,
    announcement: "",
    meals: MEALS.map((mealType, index) => ({
      mealType,
      dishes: dishes[index],
    })),
  };
}
export function menuFor(days, date) {
  return days?.find((day) => day.date === date) || sampleMenu(date);
}
export function nextMeal(bookings, now = new Date()) {
  return (bookings || [])
    .filter(
      (booking) =>
        booking.status === "active" &&
        !booking.qrUsed &&
        new Date(booking.endAt) > now,
    )
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0];
}
