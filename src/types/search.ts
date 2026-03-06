export interface SearchFilters {
  industries: string[]
  prefectures: string[]
  cities: string[]
  capital_min?: number
  capital_max?: number
  employee_min?: number
  employee_max?: number
  keyword: string
  has_website?: boolean
  status?: 'active' | 'closed' | 'merged'
  sort_by: 'name' | 'capital' | 'employee_count' | 'updated_at'
  sort_order: 'asc' | 'desc'
}

export interface CompanyResult {
  id: string
  corporate_number: string
  name: string
  prefecture_name: string
  city_name: string | null
  representative_name: string | null
  capital: number | null
  employee_count: number | null
  industry_names: string[]
  business_summary: string | null
  website_url: string | null
  updated_at: string
}

export interface SearchResponse {
  total_count_approx: number
  companies: CompanyResult[]
  next_cursor: string | null
  has_more: boolean
}

export interface CountResponse {
  total_count_approx: number
  source: 'materialized_view' | 'estimate'
}

export interface IndustryNode {
  code: string
  name: string
  level: 'major' | 'middle'
  parent_code: string | null
  children?: IndustryNode[]
}

export interface RegionGroup {
  name: string
  prefectures: Array<{
    code: string
    name: string
  }>
}

export const DEFAULT_FILTERS: SearchFilters = {
  industries: [],
  prefectures: [],
  cities: [],
  keyword: '',
  sort_by: 'name',
  sort_order: 'asc',
}

// ---------- Filter chip types ----------

export type FilterCategory = 'industry' | 'region' | 'other'

export interface FilterChip {
  id: string
  label: string
  category: FilterCategory
}
