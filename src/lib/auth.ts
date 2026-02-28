import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";

// ========================================
// Type Definitions
// ========================================

export interface UserRegistrationData {
  email: string;
  name: string;
  age: number;
  gender?: "M" | "F" | "OTHER";
  phone?: string;
  authMethod: "EMAIL" | "GOOGLE" | "LINE";
}

export interface UserProfileData {
  age?: number;
  gender?: string;
  phone?: string;
  occupation?: string;
  children?: number;
  spouse?: boolean;
  prefecture?: string;
  existingInsurance?: boolean;
}

export interface RegistrationResponse {
  status: "success" | "error";
  userId?: string;
  message?: string;
  errors?: Record<string, string>;
}

export interface AuthResponse {
  status: "success" | "error";
  message?: string;
  userId?: string;
}

// ========================================
// Session Management
// ========================================

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30分

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  
  if (!userId) return null;
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // sessions テーブルで有効性確認
  if (user) {
    const session = await prisma.session.findUnique({
      where: { userId },
    });
    
    if (!session || new Date() > session.expiresAt) {
      return null; // セッション有効期限切れ
    }
  }
  
  return user;
}

// ========================================
// User Registration
// ========================================

/**
 * ユーザー新規登録
 * @param data ユーザー登録データ
 * @returns 登録結果（userId / エラー情報）
 */
export async function registerUser(
  data: UserRegistrationData
): Promise<RegistrationResponse> {
  // バリデーション
  const errors: Record<string, string> = {};
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "正しいメール形式を入力してください";
  }
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "氏名を入力してください";
  }
  
  if (!data.age || data.age < 18 || data.age > 99) {
    errors.age = "18～99歳の年齢を入力してください";
  }
  
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }
  
  // 重複メール確認
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  
  if (existingUser) {
    return {
      status: "error",
      message: "既に登録済みのメールアドレスです。ログインしてください",
    };
  }
  
  try {
    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        authMethod: data.authMethod,
      },
    });
    
    // ロ方式コンプライアンスログ記録
    await logComplianceAction("user_registered", user.id, {
      email: data.email,
      name: data.name,
      age: data.age,
    });
    
    return {
      status: "success",
      userId: user.id,
      message: "登録が完了しました。確認メールをお送りしました",
    };
  } catch {
    return {
      status: "error",
      message: "登録処理中にエラーが発生しました",
    };
  }
}

// ========================================
// Email Confirmation
// ========================================

/**
 * メール確認トークン生成・メール送信
 * @param userId ユーザーID
 * @param email メールアドレス
 */
export async function sendConfirmationEmail(
  userId: string,
  email: string
): Promise<AuthResponse> {
  try {
    // トークン生成（32バイト hex）
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分有効
    
    // DB 保存
    await prisma.emailConfirmation.create({
      data: {
        userId,
        token,
        email,
        expiresAt,
      },
    });
    
    // メール送信（削除予定：実装時に SendGrid/AWS SES統合）
    console.log(`[TODO] Send confirmation email to ${email}`);
    console.log(`Confirmation URL: /confirm?token=${token}`);
    
    return {
      status: "success",
      message: `確認メールを送信しました（有効期限: 30分）`,
    };
  } catch {
    return {
      status: "error",
      message: "メール送信に失敗しました",
    };
  }
}

/**
 * メール確認トークン検証・ユーザー有効化
 * @param token 確認トークン
 */
export async function verifyConfirmationToken(
  token: string
): Promise<AuthResponse> {
  try {
    const confirmation = await prisma.emailConfirmation.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }, // 有効期限内
      },
    });
    
    if (!confirmation) {
      return {
        status: "error",
        message:
          "確認リンクが無効です。有効期限切れの可能性があります",
      };
    }
    
    // ユーザーを有効化
    await prisma.user.update({
      where: { id: confirmation.userId },
      data: { emailVerified: new Date() },
    });
    
    // 確認トークン削除
    await prisma.emailConfirmation.delete({
      where: { id: confirmation.id },
    });
    
    // ロ方式ログ
    await logComplianceAction("email_verified", confirmation.userId, {
      email: confirmation.email,
    });
    
    return {
      status: "success",
      userId: confirmation.userId,
      message: "メール確認が完了しました",
    };
  } catch {
    return {
      status: "error",
      message: "確認処理中にエラーが発生しました",
    };
  }
}

// ========================================
// Profile Management
// ========================================

/**
 * ユーザープロフィール更新
 * @param userId ユーザーID
 * @param data 更新データ
 */
export async function updateUserProfile(
  userId: string,
  data: UserProfileData
): Promise<AuthResponse> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        occupation: data.occupation,
        childrenCount: data.children,
        hasSpouse: data.spouse,
        prefecture: data.prefecture,
        hasExistingInsurance: data.existingInsurance,
      },
    });
    
    // ロ方式ログ
    await logComplianceAction("profile_updated", userId, data);
    
    return {
      status: "success",
      message: "プロフィールが更新されました",
    };
  } catch {
    return {
      status: "error",
      message: "更新処理中にエラーが発生しました",
    };
  }
}

// ========================================
// Session Management
// ========================================

/**
 * セッション作成
 * @param userId ユーザーID
 */
export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MS);
  
  const session = await prisma.session.upsert({
    where: { userId },
    update: { expiresAt },
    create: {
      userId,
      expiresAt,
    },
  });
  
  return session.userId;
}

/**
 * セッション削除（ログアウト）
 * @param userId ユーザーID
 */
export async function destroySession(userId: string): Promise<void> {
  await prisma.session.delete({
    where: { userId },
  }).catch(() => {}); // 存在しない場合もエラーにしない
}

// ========================================
// Compliance Logging (ロ方式)
// ========================================

/**
 * ロ方式コンプライアンスアクション記録
 * @param action アクション種別
 * @param userId ユーザーID
 * @param details 詳細情報
 */
export async function logComplianceAction(
  action: string,
  userId: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.complianceLog.create({
      data: {
        userId,
        action,
        details,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Compliance logging failed:", error);
  }
}

// ========================================
// Demo User (後方互換性)
// ========================================

export async function getOrCreateDemoUser() {
  const email = "demo@taskflow.dev";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Demo User",
        age: 35,
        authMethod: "EMAIL",
      },
    });
  }
  return user;
}
