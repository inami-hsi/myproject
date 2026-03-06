"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  MapPin,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ============================================================
// Types
// ============================================================

interface CompanyIndustry {
  code: string;
  name: string;
  source: string;
  confidence: number;
}

interface CompanyDetail {
  id: string;
  corporate_number: string;
  name: string;
  name_kana?: string | null;
  postal_code?: string | null;
  prefecture_name: string;
  city_name?: string | null;
  address?: string | null;
  full_address?: string | null;
  representative_name?: string | null;
  capital?: number | null;
  employee_count?: number | null;
  business_summary?: string | null;
  website_url?: string | null;
  corporate_type?: string | null;
  establishment_date?: string | null;
  status: string;
  industries: CompanyIndustry[];
}

interface CompanyDetailModalProps {
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================================
// Helpers
// ============================================================

function formatCapital(yen: number): string {
  if (yen >= 1_0000_0000) {
    return `${(yen / 1_0000_0000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}億円`;
  }
  if (yen >= 1_0000) {
    return `${(yen / 1_0000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万円`;
  }
  return `${yen.toLocaleString("ja-JP")}円`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function statusLabel(status: string): string {
  switch (status) {
    case "active":
      return "営業中";
    case "closed":
      return "閉鎖";
    case "merged":
      return "合併";
    default:
      return status;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-red-100 text-red-800";
    case "merged":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-secondary text-foreground";
  }
}

// ============================================================
// Section components
// ============================================================

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-sm font-semibold text-foreground">
      {children}
    </h3>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-24 flex-shrink-0 text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono tabular-nums" : ""}>{value}</span>
    </div>
  );
}

// ============================================================
// Component
// ============================================================

export function CompanyDetailModal({
  companyId,
  open,
  onOpenChange,
}: CompanyDetailModalProps) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [accessLevel, setAccessLevel] = useState<"basic" | "full">("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    setCompany(null);

    try {
      const res = await fetch(`/api/companies/${id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "企業情報の取得に失敗しました");
        return;
      }

      const data = await res.json();
      setCompany(data.company);
      setAccessLevel(data.access_level);
    } catch {
      setError("企業情報の取得に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && companyId) {
      fetchCompany(companyId);
    }
    if (!open) {
      setCompany(null);
      setError(null);
    }
  }, [open, companyId, fetchCompany]);

  const gbizInfoUrl = company?.corporate_number
    ? `https://info.gbiz.go.jp/hojin/ichiran?hojinBango=${company.corporate_number}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            {company?.name ?? "企業詳細"}
          </DialogTitle>
          <DialogDescription>
            {company?.corporate_number
              ? `法人番号: ${company.corporate_number}`
              : "企業の詳細情報を表示します"}
          </DialogDescription>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Content */}
        {company && !isLoading && (
          <div className="space-y-6">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(company.status)}`}
              >
                {statusLabel(company.status)}
              </span>
              {company.corporate_type && (
                <span className="text-xs text-muted-foreground">
                  {company.corporate_type}
                </span>
              )}
            </div>

            {/* Section: Basic info */}
            <div className="space-y-2">
              <SectionTitle>基本情報</SectionTitle>
              <div className="space-y-1.5">
                <DetailRow label="企業名" value={company.name} />
                {company.name_kana && (
                  <DetailRow label="フリガナ" value={company.name_kana} />
                )}
                <DetailRow
                  label="法人番号"
                  value={company.corporate_number}
                  mono
                />
                {company.establishment_date && (
                  <DetailRow
                    label="設立日"
                    value={formatDate(company.establishment_date)}
                  />
                )}
              </div>
            </div>

            {/* Section: Industries */}
            {company.industries.length > 0 && (
              <div className="space-y-2">
                <SectionTitle>業種</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {company.industries.map((ind) => (
                    <span
                      key={ind.code}
                      className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground"
                    >
                      {ind.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Contact / Location */}
            <div className="space-y-2">
              <SectionTitle>連絡先</SectionTitle>
              <div className="space-y-1.5">
                {accessLevel === "full" ? (
                  <>
                    {company.full_address ? (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <span>
                          {company.postal_code && (
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">
                              〒{company.postal_code}{" "}
                            </span>
                          )}
                          {company.full_address}
                        </span>
                      </div>
                    ) : (
                      <DetailRow
                        label="所在地"
                        value={
                          company.city_name
                            ? `${company.prefecture_name} ${company.city_name}`
                            : company.prefecture_name
                        }
                      />
                    )}
                    <DetailRow
                      label="代表者"
                      value={company.representative_name}
                    />
                    {company.website_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {company.website_url}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <DetailRow
                      label="所在地"
                      value={
                        company.city_name
                          ? `${company.prefecture_name} ${company.city_name}`
                          : company.prefecture_name
                      }
                    />
                    <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      <span>
                        詳細な連絡先情報はStarterプラン以上で閲覧できます
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section: Financial */}
            <div className="space-y-2">
              <SectionTitle>財務情報</SectionTitle>
              <div className="space-y-1.5">
                {accessLevel === "full" ? (
                  <>
                    {company.capital !== null && company.capital !== undefined && (
                      <DetailRow
                        label="資本金"
                        value={formatCapital(company.capital)}
                        mono
                      />
                    )}
                    {company.employee_count !== null &&
                      company.employee_count !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono tabular-nums">
                            {company.employee_count.toLocaleString("ja-JP")}名
                          </span>
                        </div>
                      )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span>
                      財務情報はStarterプラン以上で閲覧できます
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Business summary */}
            {accessLevel === "full" && company.business_summary && (
              <div className="space-y-2">
                <SectionTitle>事業概要</SectionTitle>
                <p className="text-sm leading-relaxed text-foreground">
                  {company.business_summary}
                </p>
              </div>
            )}

            {/* External link */}
            {gbizInfoUrl && (
              <div className="border-t pt-4">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a
                    href={gbizInfoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    gBizINFOで確認
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
