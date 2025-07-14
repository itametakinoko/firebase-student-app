# 学生管理システム with AI顔認識

Next.jsとFirebaseを使用した学生管理システムです。AI顔認識機能により、顔画像から学生を検索できます。

## 機能

### 🎓 基本機能
- **学生登録**: 学生情報と顔写真の登録
- **学生一覧**: 登録された学生のリスト表示
- **学生検索**: 名前、学科、入学年による検索
- **詳細表示**: 個別の学生情報詳細ページ

### 🤖 AI顔認識検索
- **高精度顔認識**: Azure Face APIを使用した顔検出
- **類似度判定**: アップロード画像と登録画像の類似度計算
- **リアルタイム検索**: 数秒で類似する顔を検索
- **信頼度表示**: 検索結果の信頼度をパーセンテージで表示

### 🧠 AI検索
- **自然言語検索**: 日本語で検索条件を記述
- **多様な条件**: スキル、経験、学科など複数条件での検索
- **スコアリング**: AIによる総合評価スコア

## 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS
- **バックエンド**: Firebase Firestore
- **AIサービス**: Azure Face API
- **画像処理**: Canvas API, File API

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local`ファイルを作成し、以下の設定を追加：

```env
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Azure Face API設定
NEXT_PUBLIC_AZURE_FACE_ENDPOINT=https://your-face-api.cognitiveservices.azure.com
NEXT_PUBLIC_AZURE_FACE_KEY=your_azure_face_api_key
NEXT_PUBLIC_AZURE_REGION=japaneast
```

### 3. Azure Face APIの設定

1. [Azure Portal](https://portal.azure.com)にアクセス
2. Cognitive Servicesリソースを作成
3. Face APIを有効化
4. エンドポイントURLとAPIキーを取得
5. 環境変数に設定

### 4. 開発サーバーの起動
```bash
npm run dev
```

## 使用方法

### 学生登録
1. 「学生登録」ページにアクセス
2. 学生情報を入力
3. 顔写真をアップロード
4. 登録完了

### AI顔認識検索
1. 「AI顔認識」タブを選択
2. 検索したい顔画像をアップロード
3. 「AI顔認識で検索」ボタンをクリック
4. 類似度の高い順に結果を表示

### AI検索
1. 「AI検索」タブを選択
2. 検索条件を自然言語で記述
3. 必要に応じて詳細条件を設定
4. 「AI検索を実行」ボタンをクリック

## 顔認識の仕組み

### Azure Face API
- **顔検出**: 画像から顔を自動検出
- **顔特徴抽出**: 128次元の特徴ベクトルを抽出
- **類似度計算**: コサイン類似度による比較
- **信頼度評価**: 0-1の範囲で信頼度を算出

### 検索プロセス
1. アップロード画像から顔を検出
2. 登録済み学生の画像から顔を検出
3. 顔特徴ベクトルを比較
4. 類似度60%以上をマッチング判定
5. 類似度順に結果を表示

## 注意事項

- 顔画像は1つの顔のみが写っているものを使用
- 画像サイズは10MB以下
- 顔がはっきり写っている画像を使用
- プライバシーに配慮した画像を使用

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# firebase-student-app
