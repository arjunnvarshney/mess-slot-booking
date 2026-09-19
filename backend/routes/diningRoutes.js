const express = require("express");
const DiningDay = require("../models/DiningDay");
const { MEALS, date, today, addDays, check, text } = require("../lib/domain");
module.exports = function diningRoutes(auth, editable = false) {
  const router = express.Router();
  router.use("/dining", auth);
  router.get("/dining", async (req, res) => {
    const start = date(req.query.date || today());
    const days = await DiningDay.find({
      date: { $gte: start, $lte: addDays(start, 6) },
    })
      .select("date meals announcement updatedAt -_id")
      .sort({ date: 1 })
      .lean();
    res.json({ days });
  });
  if (editable)
    router.put("/dining/:date", async (req, res) => {
      const day = date(req.params.date);
      check(
        day >= today(),
        "Published menus can only be changed for today or a future date",
      );
      check(
        Array.isArray(req.body.meals) && req.body.meals.length === 4,
        "Provide all four meals",
      );
      const meals = MEALS.map((mealType) => {
        const matches = req.body.meals.filter(
          (meal) => meal?.mealType === mealType,
        );
        check(matches.length === 1, "Provide each meal exactly once");
        const dishes = matches[0].dishes;
        check(
          Array.isArray(dishes) && dishes.length >= 1 && dishes.length <= 10,
          "Each meal needs 1–10 dishes",
        );
        return {
          mealType,
          dishes: dishes.map((dish) => text(dish, "Dish", 80)),
        };
      });
      check(
        typeof req.body.announcement === "string" &&
          req.body.announcement.length <= 500,
        "Announcement must be at most 500 characters",
      );
      const saved = await DiningDay.findOneAndUpdate(
        { date: day },
        {
          $set: {
            meals,
            announcement: req.body.announcement.trim(),
            updatedBy: req.admin._id,
          },
        },
        { upsert: true, returnDocument: "after", runValidators: true },
      );
      res.json({
        message: "Menu and announcement published",
        date: saved.date,
      });
    });
  return router;
};
