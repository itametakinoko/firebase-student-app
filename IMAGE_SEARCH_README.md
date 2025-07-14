# 画像検索機能 - セットアップガイド

## 概要

このプロジェクトには、顔認識AIを使用した画像検索機能が実装されています。学生の顔写真をアップロードすることで、該当する学生を自動的に検索できます。

## 機能

### 🎯 主な機能
- **画像アップロード**: ドラッグ&ドロップまたはクリックで画像を選択
- **顔認識検索**: AIが画像から顔を検出し、類似する学生を検索
- **結果表示**: 類似度の高い順に学生をカード形式で表示
- **詳細ページ遷移**: 学生をクリックして詳細情報を表示
- **画像最適化**: 自動的に画像サイズと品質を最適化

### 🔧 技術仕様
- **対応画像形式**: JPG, PNG, GIF, WebP
- **最大ファイルサイズ**: 5MB
- **画像最適化**: 800x600px以下に自動リサイズ
- **検索精度**: 3段階（低・中・高）で調整可能

## セットアップ手順

### 1. 依存関係のインストール

```bash
# Node.jsがインストールされていることを確認
node --version
npm --version

# プロジェクトの依存関係をインストール
npm install

# 画像処理ライブラリをインストール（オプション）
npm install sharp @google-cloud/vision
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の設定を追加：

```env
# Google Cloud Vision API設定（オプション）
NEXT_PUBLIC_GOOGLE_VISION_ENABLED=false
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_GOOGLE_VISION_MAX_RESULTS=10

# Azure Face API設定（オプション）
NEXT_PUBLIC_AZURE_FACE_ENABLED=false
NEXT_PUBLIC_AZURE_FACE_ENDPOINT=your_endpoint_here
NEXT_PUBLIC_AZURE_FACE_API_KEY=your_api_key_here
NEXT_PUBLIC_AZURE_FACE_MAX_RESULTS=10

# ローカル顔認識設定
NEXT_PUBLIC_LOCAL_FACE_RECOGNITION_ENABLED=true
NEXT_PUBLIC_LOCAL_CONFIDENCE_THRESHOLD=0.6
NEXT_PUBLIC_LOCAL_MAX_RESULTS=5
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 使用方法

### 基本的な使用方法

1. **アプリケーションにアクセス**
   - ブラウザでアプリケーションを開く

2. **画像検索タブを選択**
   - 「📸 画像検索」タブをクリック

3. **画像をアップロード**
   - ドラッグ&ドロップで画像をアップロード
   - または「クリックして画像を選択」をクリック

4. **検索実行**
   - 「🔍 画像で検索」ボタンをクリック
   - AIが画像を分析し、類似する学生を検索

5. **結果確認**
   - 検索結果がカード形式で表示される
   - 類似度スコアも表示される

6. **詳細表示**
   - 学生カードをクリックして詳細ページに遷移

### 画像の推奨仕様

- **顔の写り方**: 正面を向いた顔がはっきり写っている
- **明度**: 適度な明るさ（暗すぎず、明すぎず）
- **解像度**: 最低300x300px以上
- **背景**: シンプルな背景が望ましい
- **人数**: 一人の顔のみ（複数人不可）

## 外部APIの設定（オプション）

### Google Cloud Vision API

1. **Google Cloud Consoleでプロジェクトを作成**
2. **Vision APIを有効化**
3. **サービスアカウントキーを作成**
4. **環境変数に設定**

```bash
# サービスアカウントキーファイルをダウンロード
# プロジェクトルートに配置
# .env.localに設定
NEXT_PUBLIC_GOOGLE_VISION_ENABLED=true
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=your_api_key
```

### Azure Face API

1. **Azure PortalでFace APIリソースを作成**
2. **エンドポイントとAPIキーを取得**
3. **環境変数に設定**

```bash
NEXT_PUBLIC_AZURE_FACE_ENABLED=true
NEXT_PUBLIC_AZURE_FACE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
NEXT_PUBLIC_AZURE_FACE_API_KEY=your_api_key
```

## トラブルシューティング

### よくある問題

#### 1. 画像がアップロードできない
- **原因**: ファイルサイズが5MBを超えている
- **解決**: 画像を圧縮するか、別の画像を使用

#### 2. 顔が検出されない
- **原因**: 画像に顔が写っていない、または顔が不明瞭
- **解決**: 正面を向いた顔がはっきり写っている画像を使用

#### 3. 検索結果が表示されない
- **原因**: データベースに学生データがない
- **解決**: まず学生登録機能でデータを追加

#### 4. APIエラーが発生する
- **原因**: 外部APIの設定が正しくない
- **解決**: 環境変数の設定を確認、またはローカルモードを使用

### デバッグ方法

1. **ブラウザの開発者ツールを開く**
2. **Consoleタブでエラーメッセージを確認**
3. **NetworkタブでAPI呼び出しを確認**

## カスタマイズ

### 検索精度の調整

`src/lib/faceRecognitionConfig.ts`で設定を変更：

```typescript
// 精度レベルを変更
const accuracy = RecognitionAccuracy.HIGH; // LOW, MEDIUM, HIGH

// 信頼度閾値を調整
const confidenceThreshold = 0.8; // 0.0-1.0
```

### UIのカスタマイズ

各コンポーネントファイルを編集：

- `src/components/ImageSearchForm.tsx`: 検索フォームのUI
- `src/components/ImageSearchResults.tsx`: 結果表示のUI

### 画像処理の調整

`src/lib/imageUtils.ts`で画像処理パラメータを変更：

```typescript
// リサイズサイズを変更
const maxWidth = 1024;
const maxHeight = 768;

// 圧縮品質を調整
const quality = 0.9; // 0.0-1.0
```

## セキュリティ考慮事項

### プライバシー保護
- アップロードされた画像は一時的にのみ保存
- 検索完了後に自動的に削除
- 個人情報の取り扱いには十分注意

### API使用量の制限
- 外部APIの使用量制限を設定
- 無料枠を超えないよう注意
- 必要に応じてレート制限を実装

## パフォーマンス最適化

### 画像最適化
- 自動リサイズ機能で転送量を削減
- 適切な圧縮率で品質とサイズのバランスを調整

### キャッシュ戦略
- 検索結果のキャッシュ機能
- 画像のキャッシュ設定

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## サポート

問題が発生した場合は、以下の手順でサポートを受けてください：

1. このREADMEのトラブルシューティングを確認
2. GitHubのIssuesで問題を報告
3. 開発チームに直接連絡

---

**注意**: この機能は教育目的で実装されています。実際の運用では、適切なセキュリティ対策とプライバシー保護を実装してください。 