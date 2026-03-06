# Insurance Project - SSOT Issue #2

**プロジェクト**: 保険商品推奨ポータルシステム  
**Phase**: 3（計画・UXレビュー）  
**作成日**: 2026年2月28日  
**ステータス**: Planning  

---

## 📋 プロジェクト概要

保険商品推奨ポータルは、顧客が自身のニーズを段階的に選択することで、最適な保険商品と推奨保険会社を提示するWebベースのガイダンスシステムです。

**目標**: 損害保険ヒアリング（自動車・火災・賠償・傷害）の Phase 4 実装開始

---

## ✅ Phase 1-2 完成文書

### Phase 1: 要件定義（完了）

- ✅ [insurance-recommendation-requirements.md](../../docs/requirements/insurance-recommendation-requirements.md) - 機能要件書
- ✅ [insurance-design-system.md](../../docs/requirements/insurance-design-system.md) - デザイン要件
- ✅ [insurance-life-flow-overview.md](../../docs/requirements/insurance-life-flow-overview.md) - 生命保険フロー概要
- ✅ [insurance-loss-flow-design.md](../../docs/requirements/insurance-loss-flow-design.md) - 損害保険フロー詳細
- ✅ [insurance-project-manual.md](../../docs/requirements/insurance-project-manual.md) - プロジェクト管理マニュアル

### Phase 2: 設計（完了 - 2026-02-28）

- ✅ [insurance-spec.md](../../docs/design/insurance-spec.md) - 機能仕様書（M1-M7詳細）
- ✅ [insurance-design-system.yml](../../docs/design/insurance-design-system.yml) - デザイン体系
- ✅ [insurance-ui-guidelines.md](../../docs/design/insurance-ui-guidelines.md) - UI/UX設計方針
- ✅ [insurance-responsive-guidelines.md](../../docs/design/insurance-responsive-guidelines.md) - レスポンシブ仕様
- ✅ [insurance-test-design.md](../../docs/test-design/insurance-test-design.md) - テスト設計書

---

## 🎯 Phase 3: 計画・UXレビュー

### 3.1 UXレビュー実施

**対象**:
- UI/UX設計の CCAGI デザイン品質基準 適合性
- アクセシビリティ（WCAG AA）
- パフォーマンス目標（Lighthouse 90+）

**レビュー項目**:
```
□ カラーシステム: 4色プライマリー + セマンティックカラー設定
□ タイポグラフィ: 日本語フォント適用、サイズスケール確立
□ スペーシング: 8px単位グリッド準拠
□ コンポーネント: 5種類（Button / Card / Badge / Input / Form）定義
□ レスポンシブ: 3ブレークポイント（375/768/1024px）設定
□ アニメーション: 200ms以下 + Compositor properties準拠
□ アクセシビリティ: コントラスト比 4.5:1, タップターゲット 44px
□ パフォーマンス: 画像遅延読込 + Core Web Vitals対応
```

**レビュー完了時**:
- UXレビューレポート生成（`docs/UX-REVIEW/insurance-ux-review.md`）
- 改善提案の Severity 判定（Critical / High / Medium / Low）

### 3.2 計画フェーズ成果物

**このIssueで決定する事項**:

| 項目 | 内容 |
|------|------|
| **実装優先度** | M1 → M2 → M3-M4 → M5-M6 → M7 |
| **フェーズ分割** | Phase 4-A, 4-B, 4-C, 4-D, 4-E（5段階） |
| **開発体制** | CodeGenAgent + ReviewAgent + QAAgent |
| **デプロイ計画** | Docker (dev) → AWS (dev) → AWS (prod) 段階デプロイ |

---

## 🚀 Phase 4: 実装タスク分解

### 4.1 Phase 4-A: 会員管理 + 損害保険ヒアリング基盤（Week 1-2）

**Epic**: `#2-A: User Auth + Auto Insurance Foundation`

**タスク分解:**

#### T2-A-01: 認証エンジン実装
```
概要:       JWT認証 + セッション管理 + ロ方式コンプライアンス
対象:       M1（会員登録・ログイン・プロフィール管理）
入力:       insurance-spec.md (M1セクション)
出力:       
  - src/lib/auth.ts (拡張実装)
  - src/api/auth/* (登録・ログイン・確認エンドポイント)
  - src/types/user.ts (ユーザー型定義)
  - tests/unit/auth.test.ts (ユニットテスト)
受け入れ基準:
  □ ユーザー登録・ログイン機能 (E2Eテストで確認)
  □ メール確認トークン発行・検証
  □ セッション管理（30分 timeout）
  □ ロ方式コンプライアンスログ記録
期間:       3日
```

#### T2-A-02: ユーザープロフィール管理UI
```
概要:       プロフィール入力・編集画面（Figma → React実装）
対象:       M1 UI実装
入力:       insurance-ui-guidelines.md, responsive-guidelines.md
出力:       
  - src/components/profile/* (フォームコンポーネント)
  - src/app/(auth)/profile/page.tsx
受け入れ基準:
  □ モバイル・デスクトップ両対応（レスポンシブ）
  □ WCAG AA準拠（フォームアクセシビリティ）
  □ Lighthouse 90+ 達成
期間:       2日
```

#### T2-A-03: ヒアリングエンジン基盤
```
概要:       質問フロー管理エンジン（状態遷移・分岐）
対象:       M2基盤（損害保険共通ロジック）
入力:       insurance-spec.md (M2セクション)
出力:       
  - src/lib/questionnaire/ (質問フロー管理)
  - src/types/questionnaire.ts
  - tests/unit/questionnaire.test.ts
受け入れ基準:
  □ 質問フローJSON形式定義
  □ 条件分岐エンジン（if/else）
  □ 回答保存・復元機能（セッション継続）
  □ ステップカウント・進捗トラッキング
期間:       3日
```

#### T2-A-04: 自動車保険ヒアリングフロー実装
```
概要:       自動車保険の8ステップフロー実装
対象:       M2 (自動車保険)
入力:       insurance-spec.md (M2.1 自動車保険フロー)
出力:       
  - src/components/questionnaire/auto-insurance/* (質問パネル)
  - src/app/(dashboard)/questionnaire/auto-insurance/page.tsx
  - tests/e2e/auto-insurance-flow.spec.ts
受け入れ基準:
  □ 8ステップすべてのUI実装
  □ ラジオボタン・チェックボックス・スライダー等の入力要素
  □ 「戻る」機能による前ステップ移動
  □ 進捗プログレスバー表示
  □ E2Eテスト全ステップ通過
期間:       4日
```

#### T2-A-05: テスト実装 (T2-A-01 ~ T2-A-04)
```
概要:       ユニットテスト・統合テスト・E2Eテスト実装
入力:       insurance-test-design.md (Unit / Integration / E2E セクション)
出力:       
  - tests/unit/* (完備)
  - tests/integration/* (認証+DB)
  - tests/e2e/auto-insurance-flow.spec.ts
受け入れ基準:
  □ ユニットテストカバレッジ 80%以上
  □ 統合テスト全緑（PASS）
  □ E2Eテスト自動車保険フロー全ステップ PASS
期間:       4日
```

**Phase 4-A 合計**: 約16日（2.5週間）

---

### 4.2 Phase 4-B: マッチング・結果表示（Week 3-4）

**Epic**: `#2-B: Matching Engine + Result Display`

#### T2-B-01: スコアリングエンジン実装
```
概要:       保険会社マッチングのスコアリングロジック
対象:       M3 (マッチングエンジン)
入力:       insurance-spec.md (M3セクション)
出力:       
  - src/lib/matching/scoring.ts
  - src/lib/matching/rule-engine.ts
  - tests/unit/matching.test.ts
受け入れ基準:
  □ スコアリング計算式実装（4フロー向け）
  □ 保険会社マスタデータ（5社）設定
  □ ユニットテスト全パターン PASS
期間:       3日
```

#### T2-B-02: 推奨理由テキスト生成
```
概要:       なぜこの保険会社か、説得力のあるテキスト生成
対象:       M3 根拠生成ロジック
出力:       
  - src/lib/matching/reason-generator.ts
  - 根拠テンプレート（JSON）
受け入れ基準:
  □ テンプレートベース生成（パラメータ化）
  □ 自然な日本語（複数パターン用意）
  □ ロ方式準拠説明（「顧客ニーズ」「商品特性」表記）
期間:       2日
```

#### T2-B-03: ランキング表示UI
```
概要:       推奨結果の1位 / 2位 / 3位表示画面
対象:       M4 (推奨結果表示)
入力:       insurance-ui-guidelines.md
出力:       
  - src/components/recommendation/ranking.tsx
  - src/app/(dashboard)/recommendation/[userId]/page.tsx
受け入れ基準:
  □ バッジ表示（1位：緑, 2位：青, 3位：橙）
  □ スコア可視化（92/100 等）
  □ 推奨理由展開UI
  □ ボタン（見積依頼 / 相談予約），
  □ Lighthouse 90+
期間:       3日
```

#### T2-B-04: 比較表UI
```
概要:       保険会社の詳細比較表示
対象:       M4 (比較表)
出力:       
  - src/components/recommendation/comparison-table.tsx
受け入れ基準:
  □ テーブル表示（デスク）/ スタック表示（モバイル）
  □ 保険料・補償内容・サービス比較
  □ レスポンシブ対応
期間:       2日
```

#### T2-B-05: テスト実装 (T2-B-01 ~ T2-B-04)
```
概要:       マッチング・結果表示のテスト
期間:       4日
```

**Phase 4-B 合計**: 約14日（2週間）

---

### 4.3 Phase 4-C: 対面相談連携（Week 5）

**Epic**: `#2-C: Consultation Reservation System`

#### T2-C-01: 相談予約API
```
概要:       Zoom/電話予約、専門家マッチング
対象:       M5 (対面相談連携)
出力:       src/api/consultation/*.ts
期間:       3日
```

#### T2-C-02: 相談予約UI
```
概要:       モーダルDialog、カレンダー、専門家リスト
出力:       src/components/consultation/*
期間:       3日
```

#### T2-C-03: テスト
```
期間:       2日
```

**Phase 4-C 合計**: 約8日（1週間）

---

### 4.4 Phase 4-D: 管理画面（Week 6）

**Epic**: `#2-D: Admin Dashboard`

#### T2-D-01: ユーザー管理画面
```
対象:       M6 (管理画面)
出力:       src/app/(admin)/users/*
期間:       3日
```

#### T2-D-02: レポート生成
```
対象:       M6 (レポート機能)
出力:       src/lib/reporting/*
期間:       2日
```

**Phase 4-D 合計**: 約5日（1週間弱）

---

### 4.5 Phase 4-E: コンプライアンス・生命保険準備（Week 7）

**Epic**: `#2-E: Compliance + Future-proofing`

#### T2-E-01: ロ方式ログ記録
```
対象:       M7 (コンプライアンス)
出力:       src/lib/compliance/*
期間:       2日
```

#### T2-E-02: 生命保険フロー基盤準備
```
概要:       生命保険ヒアリングの UI コンポーネント基盤
対象:       M2 (生命保険用クイズエンジン拡張)
出力:       テンプレート化されたコンポーネント
期間:       3日
```

**Phase 4-E 合計**: 約5日（1週間弱）

---

## 📊 実装スケジュール

```
Week 1-2:  Phase 4-A (会員管理 + 自動車保険)        ← 優先実装
Week 3-4:  Phase 4-B (マッチング・結果表示)        ← Priority High
Week 5:    Phase 4-C (相談連携)                    
Week 6:    Phase 4-D (管理画面)                    
Week 7:    Phase 4-E (コンプライアンス)            
Week 8:    Phase 5 (テスト) + Phase 5.5 (品質ゲート)
Week 9:    Phase 6 (ドキュメント)
Week 10:   Phase 7 (デプロイ)
```

**総期間**: 約10週間（2.5ヶ月）

---

## 🏗️ 技術スタック

**フロントエンド**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui
- Responsive (375px / 768px / 1024px)

**バックエンド**:
- Node.js (Next.js API Routes)
- Prisma ORM
- PostgreSQL
- JWT (認証)

**テスト**:
- Vitest (ユニット・統合)
- Playwright (E2E)
- Docker Compose (テスト環境)

**デプロイ**:
- Docker (ローカル開発)
- AWS CodePipeline (CI/CD)
- AWS AppRunner / ECS (本番)

---

## 📝 実装ガイドライン

### コーディング標準

1. **TypeScript**: `strict: true` 必須
2. **テスト駆動**: ユニットテスト → 実装 → 統合テスト
3. **コンポーネント**: `shadcn/ui` ベース + 自定義
4. **デザイン**: `insurance-design-system.yml` 準拠

### 品質基準（Gate）

- **ユニットテスト**: カバレッジ 80%以上
- **型チェック**: `tsc --strict` PASS
- **Lint**: `eslint` PASS
- **パフォーマンス**: Lighthouse 90+ (Performance)
- **アクセシビリティ**: WCAG AA 準拠

### コミットメッセージ形式

```
feat(auto-insurance): implement 8-step questionnaire flow (#2-A-04)

- Add question panel components for all 8 steps
- Implement next/previous navigation
- Add progress bar tracking
- Implement response save/restore functionality

Related: #2, insurance-spec.md (M2.1)
```

---

## 🎯 定義完了基準（DoD: Definition of Done）

各フェーズが "完了" と判定するには：

- [ ] コード実装完了
- [ ] ユニットテスト 80%以上カバレッジ
- [ ] 統合テスト全PASS
- [ ] E2Eテスト対象範囲 全PASS
- [ ] コードレビュー完了（ReviewAgent）
- [ ] Lighthouse 90+ 達成
- [ ] WCAG AA チェック完了
- [ ] ドキュメント更新（変更あれば）
- [ ] PR作成・マージ完了

---

## 🔗 関連リソース

| ドキュメント | 用途 |
|------------|------|
| [insurance-spec.md](../../docs/design/insurance-spec.md) | 機能仕様（実装の根拠） |
| [insurance-design-system.yml](../../docs/design/insurance-design-system.yml) | デザイン体系 |
| [insurance-ui-guidelines.md](../../docs/design/insurance-ui-guidelines.md) | UI/UX設計方針 |
| [insurance-test-design.md](../../docs/test-design/insurance-test-design.md) | テスト仕様 |

---

## ✅ チェックリスト（Phase 3完了時）

- [ ] UXレビュー完了 → `docs/UX-REVIEW/insurance-ux-review.md` 生成
- [ ] Phase 4-A ～ Phase 4-E のタスク分解完了
- [ ] 開発体制・スケジュール確定
- [ ] GitHub Issue 作成（Epic 5個 + Task 30個）
- [ ] ラベル付与（`phase:4-implementation`, `priority:P1` 等）

---

## 🚀 次のステップ

1. **UXレビュー実施** → `/ux-review` コマンド実行
2. **GitHub Issue作成** → Epic + Task の自動生成
3. **Phase 4実装開始** → CodeGenAgent による実装オーケストレーション

---

**SSOT Issue作成日**: 2026年2月28日  
**次回レビュー**: Phase 4-A完了時 (Week 2)

