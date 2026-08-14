// 本檔案內容取自使用者上傳的 workout.xlsx（計畫 / 指標 兩個工作表）
// 提供「匯入範例資料」功能使用，讓使用者第一次登入即可看到教練規劃好的訓練庫與目標。

export const seedExercises = [
  // 每週自主訓練計畫（3 組 x 8-12 下，組間休息 1-2 分鐘）
  { name: "啞鈴臥推", muscle_group: "胸肌、三頭肌、前三角", category: "自主訓練", default_unit: "KG", default_sets: 3, default_reps: "8-12" },
  { name: "滑輪下拉", muscle_group: "闊背肌、二頭肌", category: "自主訓練", default_unit: "KG", default_sets: 3, default_reps: "8-12" },
  { name: "水平拉", muscle_group: "闊背肌、斜方肌、二頭肌", category: "自主訓練", default_unit: "KG", default_sets: 3, default_reps: "8-12" },
  { name: "二頭彎舉", muscle_group: "二頭肌", category: "自主訓練", default_unit: "KG", default_sets: 3, default_reps: "8-12" },
  { name: "cable三頭下壓", muscle_group: "三頭肌", category: "自主訓練", default_unit: "KG", default_sets: 3, default_reps: "8-12" },
  { name: "捲腹", muscle_group: "腹直肌", category: "自主訓練", default_unit: "KG", default_sets: 3, default_reps: "8-12" },
  // 居家訓練計畫（4 組 x 8-12 下，組間休息 1-2 分鐘）
  { name: "伏地挺身", muscle_group: "胸肌、前三角、三頭肌", category: "居家訓練", default_unit: "下", default_sets: 4, default_reps: "8-12" },
  { name: "仰臥轉體", muscle_group: "腹內外斜肌", category: "居家訓練", default_unit: "下", default_sets: 4, default_reps: "8-12" },
  { name: "臀橋（雙腳、單腳）", muscle_group: "臀大肌、股二頭", category: "居家訓練", default_unit: "下", default_sets: 4, default_reps: "8-12" },
  { name: "側抬腿", muscle_group: "臀中肌", category: "居家訓練", default_unit: "下", default_sets: 4, default_reps: "8-12" },
];

export const seedGoals = [
  // 長期目標（量化指標）
  {
    period_type: "year" as const,
    period_label: String(new Date().getFullYear()),
    title: "槓鈴臥推達 0.5 倍自體重",
    metric_name: "槓鈴臥推重量",
    target_value: 45,
    current_value: 0,
    unit: "KG",
    is_checklist: false,
  },
  {
    period_type: "year" as const,
    period_label: String(new Date().getFullYear()),
    title: "槓鈴深蹲達 0.8 倍自體重",
    metric_name: "槓鈴深蹲重量",
    target_value: 72,
    current_value: 0,
    unit: "KG",
    is_checklist: false,
  },
  {
    period_type: "year" as const,
    period_label: String(new Date().getFullYear()),
    title: "滑輪下拉 0.5 倍自體重做 10 下",
    metric_name: "滑輪下拉重量",
    target_value: 45,
    current_value: 0,
    unit: "KG",
    is_checklist: false,
  },
  // 月目標（檢核型，非量化）
  {
    period_type: "month" as const,
    period_label: new Date().toISOString().slice(0, 7),
    title: "充實動作訓練庫，熟悉更多可在自主訓練時操作的動作",
    metric_name: null,
    target_value: null,
    current_value: null,
    unit: null,
    is_checklist: true,
  },
  {
    period_type: "month" as const,
    period_label: new Date().toISOString().slice(0, 7),
    title: "熟悉人體肌肉位置和名稱",
    metric_name: null,
    target_value: null,
    current_value: null,
    unit: null,
    is_checklist: true,
  },
  {
    period_type: "month" as const,
    period_label: new Date().toISOString().slice(0, 7),
    title: "槓鈴臥推和槓鈴深蹲基礎動作訓練",
    metric_name: null,
    target_value: null,
    current_value: null,
    unit: null,
    is_checklist: true,
  },
  {
    period_type: "month" as const,
    period_label: new Date().toISOString().slice(0, 7),
    title: "自主訓練暖身、拉伸、放鬆方式",
    metric_name: null,
    target_value: null,
    current_value: null,
    unit: null,
    is_checklist: true,
  },
];
