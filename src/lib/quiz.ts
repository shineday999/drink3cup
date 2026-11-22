// Quiz 邏輯 — 規則式推薦(計劃書 §6)
// Phase 3 簡化版:用 product 的 tags 與 quiz answers 比對加權

export type QuizType = "beans" | "brewing" | "tea";

export interface QuizStep {
  id: string;
  titleKey: string;
  options: Array<{ value: string; labelKey: string }>;
}

export const BEANS_STEPS: QuizStep[] = [
  {
    id: "roast",
    titleKey: "quiz.beans.roast",
    options: [
      { value: "light_roast", labelKey: "quiz.option.beans_roast.light_roast" },
      {
        value: "medium_roast",
        labelKey: "quiz.option.beans_roast.medium_roast",
      },
      { value: "dark_roast", labelKey: "quiz.option.beans_roast.dark_roast" },
    ],
  },
  {
    id: "flavor",
    titleKey: "quiz.beans.flavor",
    options: [
      { value: "fruity", labelKey: "quiz.option.beans_flavor.fruity" },
      { value: "floral", labelKey: "quiz.option.beans_flavor.floral" },
      { value: "chocolate", labelKey: "quiz.option.beans_flavor.chocolate" },
      { value: "nutty", labelKey: "quiz.option.beans_flavor.nutty" },
      { value: "caramel", labelKey: "quiz.option.beans_flavor.caramel" },
    ],
  },
  {
    id: "method",
    titleKey: "quiz.beans.method",
    options: [
      { value: "pour_over", labelKey: "quiz.option.beans_method.pour_over" },
      { value: "espresso", labelKey: "quiz.option.beans_method.espresso" },
      { value: "immersion", labelKey: "quiz.option.beans_method.immersion" },
      { value: "cold_brew", labelKey: "quiz.option.beans_method.cold_brew" },
      { value: "any", labelKey: "quiz.option.beans_method.any" },
    ],
  },
  {
    id: "acidity",
    titleKey: "quiz.beans.acidity",
    options: [
      { value: "acid_low", labelKey: "quiz.option.beans_acidity.acid_low" },
      { value: "acid_mid", labelKey: "quiz.option.beans_acidity.acid_mid" },
      { value: "acid_high", labelKey: "quiz.option.beans_acidity.acid_high" },
    ],
  },
  {
    id: "origin",
    titleKey: "quiz.beans.origin",
    options: [
      { value: "ethiopia", labelKey: "quiz.option.beans_origin.ethiopia" },
      { value: "colombia", labelKey: "quiz.option.beans_origin.colombia" },
      { value: "taiwan", labelKey: "quiz.option.beans_origin.taiwan" },
      { value: "blend", labelKey: "quiz.option.beans_origin.blend" },
      { value: "any", labelKey: "quiz.option.beans_origin.any" },
    ],
  },
];

export const BREWING_STEPS: QuizStep[] = [
  {
    id: "gear",
    titleKey: "quiz.brewing.gear",
    options: [
      { value: "dripper", labelKey: "quiz.option.brewing_gear.dripper" },
      { value: "kettle", labelKey: "quiz.option.brewing_gear.kettle" },
      { value: "grinder", labelKey: "quiz.option.brewing_gear.grinder" },
      { value: "scale", labelKey: "quiz.option.brewing_gear.scale" },
      { value: "server", labelKey: "quiz.option.brewing_gear.server" },
    ],
  },
  {
    id: "method",
    titleKey: "quiz.brewing.method",
    options: [
      { value: "pour_over", labelKey: "quiz.option.brewing_method.pour_over" },
      { value: "espresso", labelKey: "quiz.option.brewing_method.espresso" },
      { value: "immersion", labelKey: "quiz.option.brewing_method.immersion" },
      { value: "cold_brew", labelKey: "quiz.option.brewing_method.cold_brew" },
    ],
  },
  {
    id: "level",
    titleKey: "quiz.brewing.level",
    options: [
      { value: "beginner", labelKey: "quiz.option.brewing_level.beginner" },
      {
        value: "intermediate",
        labelKey: "quiz.option.brewing_level.intermediate",
      },
      { value: "advanced", labelKey: "quiz.option.brewing_level.advanced" },
    ],
  },
  {
    id: "budget",
    titleKey: "quiz.brewing.budget",
    options: [
      {
        value: "budget_low",
        labelKey: "quiz.option.brewing_budget.budget_low",
      },
      {
        value: "budget_mid",
        labelKey: "quiz.option.brewing_budget.budget_mid",
      },
      {
        value: "budget_high",
        labelKey: "quiz.option.brewing_budget.budget_high",
      },
    ],
  },
  {
    id: "cups",
    titleKey: "quiz.brewing.cups",
    options: [
      { value: "solo", labelKey: "quiz.option.brewing_cups.solo" },
      { value: "pair", labelKey: "quiz.option.brewing_cups.pair" },
      { value: "group", labelKey: "quiz.option.brewing_cups.group" },
    ],
  },
];

export const TEA_STEPS: QuizStep[] = [
  {
    id: "tea_type",
    titleKey: "quiz.tea.tea_type",
    options: [
      { value: "green", labelKey: "quiz.option.tea_type.green" },
      { value: "black", labelKey: "quiz.option.tea_type.black" },
      { value: "oolong", labelKey: "quiz.option.tea_type.oolong" },
      { value: "white", labelKey: "quiz.option.tea_type.white" },
      { value: "dark", labelKey: "quiz.option.tea_type.dark" },
      { value: "herbal", labelKey: "quiz.option.tea_type.herbal" },
    ],
  },
  {
    id: "taste",
    titleKey: "quiz.tea.taste",
    options: [
      { value: "fresh", labelKey: "quiz.option.tea_taste.fresh" },
      { value: "mellow", labelKey: "quiz.option.tea_taste.mellow" },
      { value: "floral", labelKey: "quiz.option.tea_taste.floral" },
      { value: "roasted", labelKey: "quiz.option.tea_taste.roasted" },
      { value: "sweet", labelKey: "quiz.option.tea_taste.sweet" },
    ],
  },
  {
    id: "feeling",
    titleKey: "quiz.tea.feeling",
    options: [
      { value: "refresh", labelKey: "quiz.option.tea_feeling.refresh" },
      { value: "relax", labelKey: "quiz.option.tea_feeling.relax" },
      { value: "digest", labelKey: "quiz.option.tea_feeling.digest" },
      { value: "warm", labelKey: "quiz.option.tea_feeling.warm" },
    ],
  },
  {
    id: "tea_time",
    titleKey: "quiz.tea.tea_time",
    options: [
      { value: "morning", labelKey: "quiz.option.tea_time.morning" },
      { value: "afternoon", labelKey: "quiz.option.tea_time.afternoon" },
      { value: "evening", labelKey: "quiz.option.tea_time.evening" },
      { value: "after_meal", labelKey: "quiz.option.tea_time.after_meal" },
    ],
  },
  {
    id: "brew",
    titleKey: "quiz.tea.brew",
    options: [
      { value: "gongfu", labelKey: "quiz.option.tea_brew.gongfu" },
      { value: "mug", labelKey: "quiz.option.tea_brew.mug" },
      { value: "cold", labelKey: "quiz.option.tea_brew.cold" },
      { value: "any", labelKey: "quiz.option.tea_brew.any" },
    ],
  },
];

// 簡單 scoring:每個 answer 加 1 分,推薦前 6 名
// Phase 5 之後可用真實 quiz_rules 表加權
export function scoreProducts(
  _type: QuizType,
  answers: Record<string, string | string[]>,
  products: Array<{ id: string; slug: string; name: string; tags?: string }>,
): Array<{ id: string; slug: string; name: string; score: number }> {
  const answerTokens = new Set<string>();
  for (const val of Object.values(answers)) {
    if (Array.isArray(val)) val.forEach((v) => answerTokens.add(v));
    else answerTokens.add(val);
  }

  const scored = products
    .map((p) => {
      const tags = (p.tags ?? "").split(/[,;\s]+/).filter(Boolean);
      let score = 0;
      for (const tag of tags) if (answerTokens.has(tag)) score += 1;
      return { ...p, score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (scored.length === 0) {
    return products.slice(0, 6).map((p) => ({ ...p, score: 0 }));
  }
  return scored;
}
