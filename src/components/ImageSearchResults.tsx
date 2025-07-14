'use client';

import React from 'react';
import Link from 'next/link';
import type { FaceSimilarityResult } from '@/lib/faceRecognitionService';

interface ImageSearchResultsProps {
  results: FaceSimilarityResult[];
  loading: boolean;
  onStudentClick?: (result: FaceSimilarityResult) => void;
}

export default function ImageSearchResults({ results, loading, onStudentClick }: ImageSearchResultsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">AI顔認識中...</span>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500 space-y-1">
          <p>Azure Face APIが画像を分析しています</p>
          <p>顔の検出と類似度判定を行っています</p>
          <p>数秒〜数十秒お待ちください</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            類似する顔が見つかりませんでした
          </h3>
          <p className="text-gray-500 mb-4">
            以下の点をご確認ください：
          </p>
          <ul className="text-sm text-gray-500 space-y-1 text-left max-w-md mx-auto">
            <li>• 顔がはっきり写っている画像を使用してください</li>
            <li>• 1つの顔のみが写っている画像を使用してください</li>
            <li>• 画像の明度とコントラストが適切か確認してください</li>
            <li>• 学生が登録済みの画像か確認してください</li>
            <li>• 別の画像で再度お試しください</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🤖 AI顔認識結果
        </h3>
        <p className="text-sm text-gray-500">
          {results.length}件の類似する顔が見つかりました（類似度順）
        </p>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={result.student.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {result.student.avatarUrl ? (
                    <img
                      src={result.student.avatarUrl}
                      alt={result.student.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-semibold text-xl">
                      {result.student.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {result.student.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {result.student.department} • {result.student.admissionYear}年入学
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {result.similarity}%
                </div>
                <div className="text-xs text-gray-500">類似度</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700 mr-2">コース:</span>
                <div className="flex flex-wrap gap-1">
                  {result.student.courses.map((course, courseIndex) => (
                    <span
                      key={courseIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">信頼度:</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
              
              <div className="flex space-x-2">
                {onStudentClick && (
                  <button
                    onClick={() => onStudentClick(result)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    詳細を見る
                  </button>
                )}
                <Link
                  href={`/detail/${result.student.id}`}
                  className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  プロフィール
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🤖 AI顔認識について</h4>
        <p className="text-sm text-blue-700 mb-2">
          この機能はAzure Face APIを使用して、アップロードされた顔画像と登録されている学生の顔画像を比較し、
          類似度を判定しています。
        </p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• 類似度60%以上でマッチング判定</li>
          <li>• 高精度な顔認識アルゴリズムを使用</li>
          <li>• 年齢、性別、表情などの変化に対応</li>
          <li>• プライバシーを保護した安全な処理</li>
        </ul>
      </div>
    </div>
  );
} 