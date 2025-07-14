'use client';

import Link from 'next/link';

interface AISearchResultsProps {
  results: any[]; // Changed from AISearchResult to any[] as AISearchResult is removed
  isLoading?: boolean;
  query?: string;
}

export default function AISearchResults({ results, isLoading = false, query }: AISearchResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">AI検索中...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">該当する候補者が見つかりませんでした</h3>
          <p className="text-gray-500">
            検索条件を変更して、再度お試しください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">AI検索結果</h2>
        {query && (
          <p className="text-gray-600">
            検索条件: <span className="font-medium">{query}</span>
          </p>
        )}
        <p className="text-sm text-gray-500">
          {results.length}件の候補者が見つかりました
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
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {result.student.avatarUrl ? (
                    <img
                      src={result.student.avatarUrl}
                      alt={result.student.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-semibold text-lg">
                      {result.student.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {result.student.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {result.student.department} • {result.student.admissionYear}年入学
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {result.matchPercentage}%
                </div>
                <div className="text-xs text-gray-500">マッチ度</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700 mr-2">コース:</span>
                <div className="flex flex-wrap gap-1">
                  {result.student.courses.map((course: any, courseIndex: any) => (
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

            {result.reasons && result.reasons.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">マッチ理由:</h4>
                <ul className="space-y-1">
                  {result.reasons.map((reason: any, reasonIndex: any) => (
                    <li key={reasonIndex} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">スコア:</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{result.score}/100</span>
              </div>
              
              <Link
                href={`/detail/${result.student.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                詳細を見る
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 AI検索について</h4>
        <p className="text-sm text-blue-700">
          この検索機能は、学生の情報（名前、学科、コース、入学年）を分析し、
          指定された条件に最も適した候補者をスコア順で表示します。
          マッチ度は、条件との適合性を0-100%で評価したものです。
        </p>
      </div>
    </div>
  );
} 