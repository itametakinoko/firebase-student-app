import axios from 'axios';
import { 
  FACE_API_CONFIG, 
  FACE_API_BASE_URL, 
  FACE_DETECTION_CONFIG, 
  SIMILARITY_THRESHOLD,
  FACE_API_ERRORS,
  validateAzureFaceConfig
} from './faceRecognitionConfig';
import type { Student } from './types';

// 顔認識結果のインターフェース
export interface FaceDetectionResult {
  faceId: string;
  confidence: number;
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

// 類似度判定結果のインターフェース
export interface FaceSimilarityResult {
  student: Student;
  confidence: number;
  similarity: number;
  faceId: string;
}

// 顔認識サービスクラス
class FaceRecognitionService {
  private validateConfig(): void {
    if (!validateAzureFaceConfig()) {
      throw new Error(FACE_API_ERRORS.CONFIG_ERROR);
    }
    if (!FACE_API_BASE_URL) {
      throw new Error(FACE_API_ERRORS.ENDPOINT_ERROR);
    }
  }

  // 画像ファイルをバイナリで送信する方式に修正
  private async detectFace(imageFile: File): Promise<FaceDetectionResult[]> {
    this.validateConfig();

    const fileBuffer = await imageFile.arrayBuffer();

    try {
      const response = await axios.post(
        `${FACE_API_BASE_URL}/detect`,
        fileBuffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': FACE_API_CONFIG.key,
          },
          params: FACE_DETECTION_CONFIG,
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new Error(FACE_API_ERRORS.NO_FACE_DETECTED);
      }

      if (response.data.length > 1) {
        throw new Error(FACE_API_ERRORS.MULTIPLE_FACES);
      }

      return response.data.map((face: any) => ({
        faceId: face.faceId,
        confidence: face.confidence || 1.0,
        faceRectangle: face.faceRectangle
      }));
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(FACE_API_ERRORS.INVALID_IMAGE);
      }
      if (error.response?.status === 401) {
        throw new Error('Azure Face APIの認証に失敗しました。APIキーを確認してください。');
      }
      if (error.response?.status === 404) {
        throw new Error('Azure Face APIのエンドポイントが見つかりません。設定を確認してください。');
      }
      throw new Error(FACE_API_ERRORS.API_ERROR);
    }
  }

  private async findSimilarFaces(faceId: string, studentFaces: { student: Student; faceId: string }[]): Promise<FaceSimilarityResult[]> {
    this.validateConfig();

    if (studentFaces.length === 0) {
      return [];
    }

    try {
      const response = await axios.post(
        `${FACE_API_BASE_URL}/findsimilars`,
        {
          faceId: faceId,
          faceIds: studentFaces.map(sf => sf.faceId),
          maxNumOfCandidatesReturned: 10,
          mode: 'matchPerson'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': FACE_API_CONFIG.key,
          }
        }
      );

      const results: FaceSimilarityResult[] = [];
      
      for (const match of response.data) {
        const studentFace = studentFaces.find(sf => sf.faceId === match.faceId);
        if (studentFace && match.confidence >= SIMILARITY_THRESHOLD) {
          results.push({
            student: studentFace.student,
            confidence: match.confidence,
            similarity: Math.round(match.confidence * 100),
            faceId: match.faceId
          });
        }
      }

      return results.sort((a, b) => b.confidence - a.confidence);
    } catch (error: any) {
      console.error('類似度判定エラー:', error);
      throw new Error(FACE_API_ERRORS.API_ERROR);
    }
  }

  // 学生画像もFile型で受け取るように修正（ただし現状はBase64なので、ここは今後の拡張ポイント）
  private async detectFacesInStudentImages(students: Student[]): Promise<{ student: Student; faceId: string }[]> {
    const results: { student: Student; faceId: string }[] = [];

    for (const student of students) {
      if (student.avatarUrl && student.avatarUrl.startsWith('data:image')) {
        // Base64→Blob→File変換
        const file = this.dataUrlToFile(student.avatarUrl, `${student.id}.jpg`);
        try {
          const faces = await this.detectFace(file);
          if (faces.length > 0) {
            results.push({
              student,
              faceId: faces[0].faceId
            });
          }
        } catch (error) {
          console.warn(`学生 ${student.name} の顔検出に失敗:`, error);
        }
      }
    }

    return results;
  }

  // dataURL→File変換ユーティリティ
  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async findSimilarStudents(uploadedImageFile: File, students: Student[]): Promise<FaceSimilarityResult[]> {
    try {
      // 1. アップロードされた画像から顔を検出
      const uploadedFaces = await this.detectFace(uploadedImageFile);
      if (uploadedFaces.length === 0) {
        throw new Error(FACE_API_ERRORS.NO_FACE_DETECTED);
      }

      const uploadedFaceId = uploadedFaces[0].faceId;

      // 2. 学生の画像から顔を検出
      const studentFaces = await this.detectFacesInStudentImages(students);
      if (studentFaces.length === 0) {
        throw new Error('登録されている学生の顔画像が見つかりませんでした。');
      }

      // 3. 類似度を判定
      const similarFaces = await this.findSimilarFaces(uploadedFaceId, studentFaces);

      if (similarFaces.length === 0) {
        throw new Error(FACE_API_ERRORS.NO_MATCHES);
      }

      return similarFaces;
    } catch (error: any) {
      console.error('顔認識エラー:', error);
      throw error;
    }
  }

  // 画像の前処理（サイズ調整、形式変換など）
  async preprocessImage(file: File): Promise<File> {
    // ここではそのまま返す（必要ならリサイズ処理を追加）
    return file;
  }

  // 設定状態を確認
  isConfigured(): boolean {
    return validateAzureFaceConfig();
  }
}

// サービスのインスタンス
const faceRecognitionService = new FaceRecognitionService();

// エクスポート
export { faceRecognitionService }; 