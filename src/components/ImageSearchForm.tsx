'use client';

import React, { useState, useRef, useEffect } from 'react';
import { faceRecognitionService } from '@/lib/faceRecognitionService';
import { studentsService } from '@/lib/firebase';
import type { Student } from '@/lib/types';
import type { FaceSimilarityResult } from '@/lib/faceRecognitionService';
import { validateAzureFaceConfig } from '@/lib/faceRecognitionConfig';

interface ImageSearchFormProps {
  onSearchResults: (results: FaceSimilarityResult[]) => void;
  onLoading: (loading: boolean) => void;
}

export default function ImageSearchForm({ onSearchResults, onLoading }: ImageSearchFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsConfigured(validateAzureFaceConfig());
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ファイルサイズチェック（10MB以下）
      if (file.size > 10 * 1024 * 1024) {
        setError('ファイルサイズは10MB以下にしてください');
        return;
      }

      // 画像ファイルかチェック
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください');
        return;
      }

      setSelectedImage(file);
      setError('');

      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      setError('画像を選択してください');
      return;
    }

    if (!isConfigured) {
      setError('Azure Face APIが設定されていません。環境変数を確認してください。');
      return;
    }

    try {
      onLoading(true);
      setError('');

      // 1. 画像の前処理
      const processedImage = await faceRecognitionService.preprocessImage(selectedImage);
      
      // 2. 全学生を取得
      const allStudents = await studentsService.searchStudents();
      
      if (allStudents.length === 0) {
        setError('登録されている学生がいません');
        onLoading(false);
        return;
      }

      // 3. 顔認識検索実行
      const results = await faceRecognitionService.findSimilarStudents(processedImage, allStudents);
      onSearchResults(results);
      
    } catch (err: any) {
      setError(err.message || '検索中にエラーが発生しました');
      console.error('Face recognition search error:', err);
      onSearchResults([]);
    } finally {
      onLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isConfigured) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🤖 AI顔認識検索
        </h3>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="text-yellow-600 text-xl mr-2">⚠️</div>
            <h4 className="font-semibold text-yellow-800">Azure Face APIが設定されていません</h4>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            AI顔認識機能を使用するには、Azure Face APIの設定が必要です。
          </p>
          <div className="text-xs text-yellow-600 space-y-1">
            <p><strong>必要な設定:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>NEXT_PUBLIC_AZURE_FACE_ENDPOINT</li>
              <li>NEXT_PUBLIC_AZURE_FACE_KEY</li>
              <li>NEXT_PUBLIC_AZURE_REGION</li>
            </ul>
          </div>
          <div className="mt-3 p-3 bg-yellow-100 rounded text-xs text-yellow-800">
            <p><strong>設定手順:</strong></p>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Azure PortalでCognitive Servicesリソースを作成</li>
              <li>Face APIを有効化</li>
              <li>エンドポイントURLとAPIキーを取得</li>
              <li>.env.localファイルに設定を追加</li>
              <li>アプリケーションを再起動</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🤖 AI顔認識検索
      </h3>
      
      <div className="space-y-4">
        {/* 画像アップロードエリア */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="space-y-2">
              <div className="text-4xl">📷</div>
              <p className="text-gray-600">
                クリックして顔画像を選択、またはドラッグ&ドロップ
              </p>
              <p className="text-sm text-gray-500">
                対応形式: JPG, PNG, GIF (10MB以下)
              </p>
            </div>
          </label>
        </div>

        {/* プレビュー */}
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="プレビュー"
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* 検索ボタン */}
        <button
          onClick={handleSearch}
          disabled={!selectedImage}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          🤖 AI顔認識で検索
        </button>

        <div className="text-sm text-gray-500 text-center space-y-1">
          <p>※ 顔がはっきり写っている画像を使用してください</p>
          <p>※ 1つの顔のみが写っている画像を使用してください</p>
          <p>※ 検索には数秒〜数十秒かかる場合があります</p>
          <p>※ Azure Face APIを使用した高精度な顔認識を行います</p>
        </div>
      </div>
    </div>
  );
} 