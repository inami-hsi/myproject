import type { Database } from '@/types/database'

const BASE_URL = 'https://info.gbiz.go.jp/hojin/v1/hojin'

export interface GBizResponse {
  'hojin-infos': GBizCompany[]
  totalCount: number
  totalPage: number
  pageNumber: number
}

export interface GBizCompany {
  corporate_number: string
  name: string
  kana: string
  location: string
  representative_name: string
  capital_stock: number
  employee_number: number
  business_summary: string
  business_items: string
  company_url: string
  date_of_establishment: string
  update_date: string
  business_items_summary?: { business_items_code?: string; business_items_name?: string }[]
}

/**
 * Fields from gBizINFO that are safe to upsert without overwriting NTA-owned data.
 * NTA-owned fields (name, address, prefecture, city, postal_code, corporate_type, status)
 * are intentionally excluded.
 */
export type GBizUpsertRecord = Pick<
  Database['public']['Tables']['companies']['Update'],
  | 'representative_name'
  | 'capital'
  | 'employee_count'
  | 'business_summary'
  | 'website_url'
  | 'establishment_date'
  | 'gbiz_business_items'
  | 'gbizinfo_updated_at'
> & {
  corporate_number: string
}

export class GBizInfoClient {
  private token: string
  private requestInterval: number

  constructor(token: string, requestInterval = 1000) {
    this.token = token
    this.requestInterval = requestInterval
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async fetchByPrefecture(
    prefectureCode: string,
    page = 1
  ): Promise<GBizResponse> {
    const url = new URL(BASE_URL)
    url.searchParams.set('prefecture', prefectureCode)
    url.searchParams.set('page', page.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'X-hojinInfo-api-token': this.token,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`gBizINFO API error: ${response.status} ${response.statusText}`)
    }

    await this.sleep(this.requestInterval)
    return response.json()
  }

  /**
   * Map a gBizINFO record to a full company insert (used for initial seeding).
   * Includes all fields including NTA-owned ones.
   */
  mapToCompany(item: GBizCompany): Database['public']['Tables']['companies']['Insert'] {
    const prefectureCode = this.extractPrefectureCode(item.location)
    const prefectureName = this.extractPrefectureName(item.location)

    return {
      corporate_number: item.corporate_number,
      name: item.name,
      name_kana: item.kana || null,
      prefecture_code: prefectureCode,
      prefecture_name: prefectureName,
      full_address: item.location || null,
      representative_name: item.representative_name || null,
      capital: item.capital_stock || null,
      employee_count: typeof item.employee_number === 'number' ? item.employee_number : null,
      business_summary: item.business_summary || null,
      gbiz_business_items: item.business_items || null,
      website_url: item.company_url || null,
      establishment_date: item.date_of_establishment || null,
      status: 'active',
      gbizinfo_updated_at: item.update_date || new Date().toISOString(),
    }
  }

  /**
   * Map a gBizINFO record to gBizINFO-specific fields only.
   * Does NOT include NTA-owned fields (name, address, prefecture, city, postal_code,
   * corporate_type, status) so they are never overwritten during enrichment syncs.
   */
  mapToGBizFields(item: GBizCompany): GBizUpsertRecord {
    return {
      corporate_number: item.corporate_number,
      representative_name: item.representative_name || null,
      capital: typeof item.capital_stock === 'number' ? item.capital_stock : null,
      employee_count: typeof item.employee_number === 'number'
        ? item.employee_number
        : (typeof item.employee_number === 'string' ? parseInt(item.employee_number, 10) || null : null),
      business_summary: item.business_summary || null,
      gbiz_business_items: item.business_items || null,
      website_url: item.company_url || null,
      establishment_date: item.date_of_establishment || null,
      gbizinfo_updated_at: item.update_date || new Date().toISOString(),
    }
  }

  private extractPrefectureCode(location: string): string {
    const prefectureMap: Record<string, string> = {
      '北海道': '01', '青森県': '02', '岩手県': '03', '宮城県': '04',
      '秋田県': '05', '山形県': '06', '福島県': '07', '茨城県': '08',
      '栃木県': '09', '群馬県': '10', '埼玉県': '11', '千葉県': '12',
      '東京都': '13', '神奈川県': '14', '新潟県': '15', '富山県': '16',
      '石川県': '17', '福井県': '18', '山梨県': '19', '長野県': '20',
      '岐阜県': '21', '静岡県': '22', '愛知県': '23', '三重県': '24',
      '滋賀県': '25', '京都府': '26', '大阪府': '27', '兵庫県': '28',
      '奈良県': '29', '和歌山県': '30', '鳥取県': '31', '島根県': '32',
      '岡山県': '33', '広島県': '34', '山口県': '35', '徳島県': '36',
      '香川県': '37', '愛媛県': '38', '高知県': '39', '福岡県': '40',
      '佐賀県': '41', '長崎県': '42', '熊本県': '43', '大分県': '44',
      '宮崎県': '45', '鹿児島県': '46', '沖縄県': '47',
    }

    for (const [name, code] of Object.entries(prefectureMap)) {
      if (location.startsWith(name)) return code
    }
    return '00'
  }

  private extractPrefectureName(location: string): string {
    const match = location.match(/^(.{2,4}?[都道府県])/)
    return match ? match[1] : ''
  }
}
