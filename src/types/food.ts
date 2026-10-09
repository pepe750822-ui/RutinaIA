export interface FoodItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  portion_description: string;
}

export interface FoodAnalysis {
  items: FoodItem[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  description: string;
  confidence: "high" | "medium" | "low";
}

export interface FoodLogEntry {
  id: string;
  student_id: string;
  photo_url: string;
  analysis_json: FoodAnalysis;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  confirmed_at: string;
  created_at: string;
}
