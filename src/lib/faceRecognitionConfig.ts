console.log('ENDPOINT:', process.env.NEXT_PUBLIC_AZURE_FACE_ENDPOINT);
console.log('KEY:', process.env.NEXT_PUBLIC_AZURE_FACE_KEY);

// 顔認識APIの設定

export interface FaceRecognitionConfig {
  // Google Cloud Vision API設定
  googleVision: {
    enabled: boolean;
    apiKey?: string;
    projectId?: string;
    maxResults: number;
  };
  
  // Azure Face API設定
  azureFace: {
    enabled: boolean;
    endpoint?: string;
    apiKey?: string;
    maxResults: number;
  };
  
  // ローカル顔認識設定
  local: {
    enabled: boolean;
    confidenceThreshold: number;
    maxResults: number;
  };
}

// デフォルト設定
export const defaultConfig: FaceRecognitionConfig = {
  googleVision: {
    enabled: false,
    maxResults: 10
  },
  azureFace: {
    enabled: false,
    maxResults: 10
  },
  local: {
    enabled: true,
    confidenceThreshold: 0.6,
    maxResults: 5
  }
};

// 環境変数から設定を読み込み
export function getFaceRecognitionConfig(): FaceRecognitionConfig {
  return {
    googleVision: {
      enabled: process.env.NEXT_PUBLIC_GOOGLE_VISION_ENABLED === 'true',
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY,
      projectId: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID,
      maxResults: parseInt(process.env.NEXT_PUBLIC_GOOGLE_VISION_MAX_RESULTS || '10')
    },
    azureFace: {
      enabled: process.env.NEXT_PUBLIC_AZURE_FACE_ENABLED === 'true',
      endpoint: process.env.NEXT_PUBLIC_AZURE_FACE_ENDPOINT,
      apiKey: process.env.NEXT_PUBLIC_AZURE_FACE_API_KEY,
      maxResults: parseInt(process.env.NEXT_PUBLIC_AZURE_FACE_MAX_RESULTS || '10')
    },
    local: {
      enabled: process.env.NEXT_PUBLIC_LOCAL_FACE_RECOGNITION_ENABLED !== 'false',
      confidenceThreshold: parseFloat(process.env.NEXT_PUBLIC_LOCAL_CONFIDENCE_THRESHOLD || '0.6'),
      maxResults: parseInt(process.env.NEXT_PUBLIC_LOCAL_MAX_RESULTS || '5')
    }
  };
}

// API使用量の制限設定
export interface APIRateLimit {
  requestsPerMinute: number;
  requestsPerDay: number;
  maxImageSize: number; // MB
}

export const rateLimits: Record<string, APIRateLimit> = {
  googleVision: {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    maxImageSize: 10
  },
  azureFace: {
    requestsPerMinute: 20,
    requestsPerDay: 30000,
    maxImageSize: 6
  },
  local: {
    requestsPerMinute: 100,
    requestsPerDay: 10000,
    maxImageSize: 5
  }
};

// エラーメッセージの定義
export const errorMessages = {
  NO_FACE_DETECTED: '画像から顔が検出されませんでした。顔がはっきり写っている画像を使用してください。',
  MULTIPLE_FACES: '複数の顔が検出されました。一人の顔が写っている画像を使用してください。',
  IMAGE_TOO_LARGE: '画像サイズが大きすぎます。5MB以下の画像を使用してください。',
  UNSUPPORTED_FORMAT: 'サポートされていない画像形式です。JPG、PNG、GIF形式を使用してください。',
  API_ERROR: '顔認識APIでエラーが発生しました。しばらく時間をおいて再度お試しください。',
  RATE_LIMIT_EXCEEDED: 'API使用量の制限に達しました。しばらく時間をおいて再度お試しください。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
};

// 顔認識の精度レベル
export enum RecognitionAccuracy {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// 精度レベルに応じた設定
export const accuracySettings = {
  [RecognitionAccuracy.LOW]: {
    confidenceThreshold: 0.5,
    maxResults: 10,
    processingTime: 1000
  },
  [RecognitionAccuracy.MEDIUM]: {
    confidenceThreshold: 0.7,
    maxResults: 5,
    processingTime: 2000
  },
  [RecognitionAccuracy.HIGH]: {
    confidenceThreshold: 0.9,
    maxResults: 3,
    processingTime: 3000
  }
};

// Azure Face API設定
export const FACE_API_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_AZURE_FACE_ENDPOINT || '',
  key: process.env.NEXT_PUBLIC_AZURE_FACE_KEY || '',
  region: process.env.NEXT_PUBLIC_AZURE_REGION || 'japaneast',
};

// 環境変数の検証
export function validateAzureFaceConfig(): boolean {
  return !!(FACE_API_CONFIG.endpoint && FACE_API_CONFIG.key);
}

// 顔認識APIのベースURL
export const FACE_API_BASE_URL = FACE_API_CONFIG.endpoint ? `${FACE_API_CONFIG.endpoint}/face/v1.0` : '';

// 顔認識の設定
export const FACE_DETECTION_CONFIG = {
  returnFaceId: true,
  returnFaceLandmarks: false,
  recognitionModel: 'recognition_04',
  returnRecognitionModel: false,
  detectionModel: 'detection_01',
  returnFaceRectangle: true,
};

// 類似度判定の閾値
export const SIMILARITY_THRESHOLD = 0.6; // 60%以上を類似と判定

// エラーメッセージ
export const FACE_API_ERRORS = {
  NO_FACE_DETECTED: '顔が検出されませんでした。別の画像をお試しください。',
  MULTIPLE_FACES: '複数の顔が検出されました。1つの顔が写っている画像をお試しください。',
  API_ERROR: '顔認識APIでエラーが発生しました。',
  NO_MATCHES: '類似する顔が見つかりませんでした。',
  INVALID_IMAGE: '画像の形式が正しくありません。',
  CONFIG_ERROR: 'Azure Face APIの設定が不完全です。環境変数を確認してください。',
  ENDPOINT_ERROR: 'Azure Face APIのエンドポイントが設定されていません。',
}; 