"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export interface ProfileFormData {
  age?: number;
  gender?: string;
  phone?: string;
  occupation?: string;
  children?: number;
  spouse?: boolean;
  prefecture?: string;
  existingInsurance?: boolean;
}

const occupations = [
  "会社員",
  "自営業",
  "公務員",
  "パート・アルバイト",
  "学生",
  "無職",
  "その他",
];

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

export default function ProfileForm() {
  const [form, setForm] = useState<ProfileFormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setForm(data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      }
    } catch {
        setError("更新に失敗しました");
      } finally {
      setLoading(false);
    }
  };

  return (
    <form
      data-testid="profile-form"
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-4 space-y-6"
    >
      {error && <p className="text-destructive">{error}</p>}

      <div>
        <Label htmlFor="occupation">職業</Label>
        <Select name="occupation" onValueChange={(val) => setForm(f => ({...f, occupation: val}))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {occupations.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="children">子ども人数</Label>
        <Input
          id="children"
          name="children"
          type="number"
          min={0}
          value={form.children ?? ""}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="spouse"
          name="spouse"
          type="checkbox"
          checked={form.spouse ?? false}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <Label htmlFor="spouse">配偶者がいる</Label>
      </div>

      <div>
        <Label htmlFor="prefecture">都道府県</Label>
        <Select name="prefecture" onValueChange={(val) => setForm(f => ({...f, prefecture: val}))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {prefectures.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="existingInsurance"
          name="existingInsurance"
          type="checkbox"
          checked={form.existingInsurance ?? false}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <Label htmlFor="existingInsurance">既存の保険に加入している</Label>
      </div>

      <div className="space-y-4">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "保存中…" : "保存"}
        </Button>
      </div>
    </form>
  );
}
