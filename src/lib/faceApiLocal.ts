import * as faceapi from 'face-api.js';
import type { Student } from './types';

// モデルのパス（public配下に配置）
const MODEL_URL = '/models';

// モデルのロード
export async function loadFaceApiModels() {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]);
}

// 顔特徴ベクトルを抽出
export async function getFaceDescriptor(image: HTMLImageElement | HTMLCanvasElement | File): Promise<Float32Array | null> {
  let input: HTMLImageElement | HTMLCanvasElement;
  if (image instanceof File) {
    const img = await fileToImage(image);
    input = img;
  } else {
    input = image;
  }
  const detection = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor();
  if (!detection) return null;
  return detection.descriptor;
}

// 2つの特徴ベクトルのコサイン類似度
export function cosineSimilarity(vec1: Float32Array, vec2: Float32Array): number {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    normA += vec1[i] * vec1[i];
    normB += vec2[i] * vec2[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// File→HTMLImageElement変換
async function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 学生リストから顔特徴ベクトルを抽出
export async function getStudentFaceDescriptors(students: Student[]): Promise<{ student: Student; descriptor: Float32Array }[]> {
  const results: { student: Student; descriptor: Float32Array }[] = [];
  for (const student of students) {
    if (student.avatarUrl && student.avatarUrl.startsWith('data:image')) {
      const img = await fileToImage(dataUrlToFile(student.avatarUrl, `${student.id}.jpg`));
      const desc = await getFaceDescriptor(img);
      if (desc) {
        results.push({ student, descriptor: desc });
      }
    }
  }
  return results;
}

// dataURL→File変換
function dataUrlToFile(dataUrl: string, filename: string): File {
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