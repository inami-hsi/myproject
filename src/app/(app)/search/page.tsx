import type { Metadata } from "next";
import { SearchLayout } from "@/components/search/SearchLayout";

export const metadata: Metadata = {
  title: "企業検索",
  description:
    "業種・地域・従業員数などの条件で企業を検索。検索結果をCSV/Excelでダウンロード。",
};

export default function SearchPage() {
  return <SearchLayout />;
}
