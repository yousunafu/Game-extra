# Zaico API セキュリティ設定

## 概要
フロントエンドからzaico APIトークンを排除し、Next.jsのAPIルート経由で安全にアクセスする設定です。

## 設定手順

### 1. 環境変数の設定
`.env.local` ファイルを作成し、以下を追加：

```bash
# zaico API設定
ZAICO_API_TOKEN=HjqREprLiqeb83fsDahXGKSb3w3M9TCR
```

### 2. ファイル構成
```
pages/api/zaico/[...path].ts  # API中継サーバー
src/utils/zaicoClient.js      # セキュア版クライアント
src/utils/zaicoApi.js         # 非推奨（既存コード用）
```

### 3. 使用方法

#### 既存コードの移行
```javascript
// 変更前（非セキュア）
import { createOutboundItemInZaico } from '../utils/zaicoApi';

// 変更後（セキュア）
import { createOutboundItemInZaico } from '../utils/zaicoClient';
```

#### 新しいコード
```javascript
import { 
  createInventoryInZaico,
  createPurchaseInZaico,
  createOutboundItemInZaico,
  getInventoriesFromZaico,
  getPackingSlipsFromZaico,
  logSyncActivity
} from '../utils/zaicoClient';
```

## セキュリティの改善点

### ✅ 改善前
- APIトークンがフロントエンドに露出
- ブラウザの開発者ツールでトークンが見える
- 攻撃者にトークンを抜かれるリスク

### ✅ 改善後
- APIトークンはサーバーサイドのみ
- フロントエンドからは見えない
- 攻撃者にトークンを抜かれるリスクなし

## 注意事項

1. **環境変数の管理**: `.env.local` は `.gitignore` に追加してください
2. **本番環境**: 本番環境では環境変数を適切に設定してください
3. **既存コード**: 既存の `zaicoApi.js` は非推奨ですが、互換性のため残しています

## トラブルシューティング

### エラー: "ZAICO_API_TOKEN is not configured"
→ `.env.local` ファイルが正しく設定されているか確認

### エラー: "Method not allowed"
→ APIルートで許可されていないメソッドを使用している

### エラー: "Internal server error"
→ サーバーサイドのログを確認


