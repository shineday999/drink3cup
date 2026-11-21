// Quiz 邏輯 — 規則式推薦(計劃書 §6)
// Phase 3 簡化版:用 product 的 tags 與 quiz answers 比對加權

export type QuizType = "jewelry" | "incense" | "tea";

export interface JewelryAnswers {
  face_shape: "oval" | "round" | "square" | "long" | "heart" | "diamond";
  skin_tone: "cool" | "warm" | "neutral";
  personality: "calm" | "free" | "mysterious" | "fresh" | "classic";
  occasion: "daily" | "formal" | "outdoor" | "gift";
  material: "pure_amber" | "amber_wood" | "amber_metal" | "any";
}

export interface IncenseAnswers {
  concerns: Array<
    "anxiety" | "fatigue" | "mood" | "stale_space" | "calm" | "focus"
  >;
  goals: Array<
    "relax" | "sleep" | "meditate" | "energize" | "purify" | "focus"
  >;
  format: "stick" | "balm" | "oil" | "burner";
  timing: "morning" | "afternoon" | "evening" | "bedtime" | "all_day";
  scent: "woody" | "floral" | "herbal" | "resin" | "any";
}

export interface QuizStep {
  id: string;
  titleKey: string;
  options: Array<{ value: string; labelKey: string }>;
}

export const JEWELRY_STEPS: QuizStep[] = [
  {
    id: "face_shape",
    titleKey: "quiz.jewelry.face_shape",
    options: [
      { value: "oval", labelKey: "quiz.option.face.oval" },
      { value: "round", labelKey: "quiz.option.face.round" },
      { value: "square", labelKey: "quiz.option.face.square" },
      { value: "long", labelKey: "quiz.option.face.long" },
      { value: "heart", labelKey: "quiz.option.face.heart" },
      { value: "diamond", labelKey: "quiz.option.face.diamond" },
    ],
  },
  {
    id: "skin_tone",
    titleKey: "quiz.jewelry.skin_tone",
    options: [
      { value: "cool", labelKey: "quiz.option.skin.cool" },
      { value: "warm", labelKey: "quiz.option.skin.warm" },
      { value: "neutral", labelKey: "quiz.option.skin.neutral" },
    ],
  },
  {
    id: "personality",
    titleKey: "quiz.jewelry.personality",
    options: [
      { value: "calm", labelKey: "quiz.option.personality.calm" },
      { value: "free", labelKey: "quiz.option.personality.free" },
      { value: "mysterious", labelKey: "quiz.option.personality.mysterious" },
      { value: "fresh", labelKey: "quiz.option.personality.fresh" },
      { value: "classic", labelKey: "quiz.option.personality.classic" },
    ],
  },
  {
    id: "occasion",
    titleKey: "quiz.jewelry.occasion",
    options: [
      { value: "daily", labelKey: "quiz.option.occasion.daily" },
      { value: "formal", labelKey: "quiz.option.occasion.formal" },
      { value: "outdoor", labelKey: "quiz.option.occasion.outdoor" },
      { value: "gift", labelKey: "quiz.option.occasion.gift" },
    ],
  },
  {
    id: "material",
    titleKey: "quiz.jewelry.material",
    options: [
      { value: "pure_amber", labelKey: "quiz.option.material.pure_amber" },
      { value: "amber_wood", labelKey: "quiz.option.material.amber_wood" },
      { value: "amber_metal", labelKey: "quiz.option.material.amber_metal" },
      { value: "any", labelKey: "quiz.option.material.any" },
    ],
  },
];

export const INCENSE_STEPS: QuizStep[] = [
  {
    id: "concerns",
    titleKey: "quiz.incense.concerns",
    options: [
      { value: "anxiety", labelKey: "quiz.option.concern.anxiety" },
      { value: "fatigue", labelKey: "quiz.option.concern.fatigue" },
      { value: "mood", labelKey: "quiz.option.concern.mood" },
      { value: "stale_space", labelKey: "quiz.option.concern.stale_space" },
      { value: "calm", labelKey: "quiz.option.concern.calm" },
      { value: "focus", labelKey: "quiz.option.concern.focus" },
    ],
  },
  {
    id: "goals",
    titleKey: "quiz.incense.goals",
    options: [
      { value: "relax", labelKey: "quiz.option.goal.relax" },
      { value: "sleep", labelKey: "quiz.option.goal.sleep" },
      { value: "meditate", labelKey: "quiz.option.goal.meditate" },
      { value: "energize", labelKey: "quiz.option.goal.energize" },
      { value: "purify", labelKey: "quiz.option.goal.purify" },
      { value: "focus", labelKey: "quiz.option.goal.focus" },
    ],
  },
  {
    id: "format",
    titleKey: "quiz.incense.format",
    options: [
      { value: "stick", labelKey: "quiz.option.format.stick" },
      { value: "balm", labelKey: "quiz.option.format.balm" },
      { value: "oil", labelKey: "quiz.option.format.oil" },
      { value: "burner", labelKey: "quiz.option.format.burner" },
    ],
  },
  {
    id: "timing",
    titleKey: "quiz.incense.timing",
    options: [
      { value: "morning", labelKey: "quiz.option.timing.morning" },
      { value: "afternoon", labelKey: "quiz.option.timing.afternoon" },
      { value: "evening", labelKey: "quiz.option.timing.evening" },
      { value: "bedtime", labelKey: "quiz.option.timing.bedtime" },
      { value: "all_day", labelKey: "quiz.option.timing.all_day" },
    ],
  },
  {
    id: "scent",
    titleKey: "quiz.incense.scent",
    options: [
      { value: "woody", labelKey: "quiz.option.scent.woody" },
      { value: "floral", labelKey: "quiz.option.scent.floral" },
      { value: "herbal", labelKey: "quiz.option.scent.herbal" },
      { value: "resin", labelKey: "quiz.option.scent.resin" },
      { value: "any", labelKey: "quiz.option.scent.any" },
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
