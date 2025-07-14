import { studentsService } from './firebase';
import type { Student } from './types';

// AI検索のためのインターフェース
export interface AISearchQuery {
  description: string;
  requirements?: string[];
  skills?: string[];
  experience?: string;
  department?: string;
  admissionYear?: number;
}

// AI検索結果のインターフェース
export interface AISearchResult {
  student: Student;
  score: number;
  reasons: string[];
  matchPercentage: number;
}

// 模擬AI検索エンジン（実際のAI APIに置き換え可能）
class AISearchEngine {
  private async analyzeStudentProfile(student: Student, query: AISearchQuery): Promise<AISearchResult> {
    let score = 0;
    const reasons: string[] = [];
    
    // 名前によるマッチング
    if (query.description.toLowerCase().includes(student.name.toLowerCase())) {
      score += 30;
      reasons.push(`名前が一致: ${student.name}`);
    }
    
    // 学科によるマッチング
    if (query.department && student.department === query.department) {
      score += 25;
      reasons.push(`学科が一致: ${student.department}`);
    }
    
    // 入学年によるマッチング
    if (query.admissionYear && student.admissionYear === query.admissionYear) {
      score += 15;
      reasons.push(`入学年が一致: ${student.admissionYear}年`);
    }
    
    // コースによるマッチング
    if (query.requirements && student.courses) {
      const matchingCourses = query.requirements.filter(req => 
        student.courses.some(course => 
          course.toLowerCase().includes(req.toLowerCase()) ||
          req.toLowerCase().includes(course.toLowerCase())
        )
      );
      if (matchingCourses.length > 0) {
        score += matchingCourses.length * 10;
        reasons.push(`コースが一致: ${matchingCourses.join(', ')}`);
      }
    }
    
    // スキルによるマッチング（コースから推測）
    if (query.skills && student.courses) {
      const matchingSkills = query.skills.filter(skill => 
        student.courses.some(course => 
          course.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(course.toLowerCase())
        )
      );
      if (matchingSkills.length > 0) {
        score += matchingSkills.length * 8;
        reasons.push(`スキルが一致: ${matchingSkills.join(', ')}`);
      }
    }
    
    // 経験年数によるマッチング（入学年から推測）
    if (query.experience) {
      const currentYear = new Date().getFullYear();
      const yearsOfStudy = currentYear - student.admissionYear;
      
      if (query.experience.includes('1年') && yearsOfStudy === 1) {
        score += 10;
        reasons.push('経験年数が一致: 1年生');
      } else if (query.experience.includes('2年') && yearsOfStudy === 2) {
        score += 10;
        reasons.push('経験年数が一致: 2年生');
      } else if (query.experience.includes('3年') && yearsOfStudy === 3) {
        score += 10;
        reasons.push('経験年数が一致: 3年生');
      } else if (query.experience.includes('4年') && yearsOfStudy === 4) {
        score += 10;
        reasons.push('経験年数が一致: 4年生');
      }
    }
    
    // 自然言語によるマッチング
    const description = query.description.toLowerCase();
    const studentInfo = `${student.name} ${student.department} ${student.courses.join(' ')}`.toLowerCase();
    
    const keywords = description.split(' ').filter(word => word.length > 2);
    const matchingKeywords = keywords.filter(keyword => 
      studentInfo.includes(keyword)
    );
    
    if (matchingKeywords.length > 0) {
      score += matchingKeywords.length * 5;
      reasons.push(`キーワードが一致: ${matchingKeywords.join(', ')}`);
    }
    
    // スコアを正規化（0-100の範囲）
    const maxPossibleScore = 100;
    const normalizedScore = Math.min(score, maxPossibleScore);
    const matchPercentage = Math.round((normalizedScore / maxPossibleScore) * 100);
    
    return {
      student,
      score: normalizedScore,
      reasons,
      matchPercentage
    };
  }
  
  async searchCandidates(query: AISearchQuery): Promise<AISearchResult[]> {
    try {
      // 全学生を取得
      const allStudents = await studentsService.searchStudents();
      
      // 各学生に対してAI分析を実行
      const results = await Promise.all(
        allStudents.map(student => this.analyzeStudentProfile(student, query))
      );
      
      // スコアでソート（高い順）
      const sortedResults = results
        .filter(result => result.score > 0) // スコアが0より大きいもののみ
        .sort((a, b) => b.score - a.score);
      
      return sortedResults;
    } catch (error) {
      console.error('AI検索エラー:', error);
      throw new Error('AI検索中にエラーが発生しました');
    }
  }
}

// AI検索サービスのインスタンス
const aiSearchEngine = new AISearchEngine();

// エクスポートする関数
export const aiSearchService = {
  async searchCandidates(query: AISearchQuery): Promise<AISearchResult[]> {
    return aiSearchEngine.searchCandidates(query);
  },
  
  // 検索クエリの例を提供
  getExampleQueries(): AISearchQuery[] {
    return [
      {
        description: "プログラミングが得意な学生",
        skills: ["プログラミング", "コーディング"],
        department: "情報工学科"
      },
      {
        description: "研究活動に興味がある3年生",
        experience: "3年",
        requirements: ["研究", "実験"]
      },
      {
        description: "リーダーシップのある学生",
        requirements: ["プロジェクト", "チームワーク"]
      }
    ];
  }
}; 