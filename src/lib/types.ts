export type Department = "経営学科" | "ビジネスエコノミクス学科" | "国際デザイン経営学科";
export type Course = "経営学入門" | "統計学入門" | "データ分析" | "ゲーム理論概論" | "異文化コミュニケーション";

export type Student = {
  id?: string;
  name: string;
  admissionYear: number;
  department: Department;
  courses: Course[];
  avatarUrl?: string;
  [key: string]: any;
};

export type StudentSearchFilters = {
  name?: string;
  admissionYear?: number;
  department?: Department;
  courses?: Course[];
  [key: string]: any;
}; 