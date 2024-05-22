import type { Express } from 'express'
import geoip from 'geoip-lite'
import requestIp from 'request-ip'

type LikeRequest = Record<string, any>

export const getClientDataByRequest = <TLang extends string>({ req, langs }: { req: LikeRequest; langs?: TLang[] }) => {
  const ip = requestIp.getClientIp(req)
  const geoipData = ip ? geoip.lookup(ip) : null
  const country = geoipData?.country.toLowerCase() || null
  const providedLangs: string[] = req.headers?.['accept-language']?.split(',') || []
  const suitableLang = langs?.find((lang) => providedLangs.some((providedLang) => providedLang.includes(lang)))
  const lang = suitableLang || langs?.[0] || 'en'
  return {
    ip,
    country,
    lang: lang as TLang,
  }
}
// type RequestClientData<TLang extends string> = ReturnType<typeof getClientDataByRequest<TLang>>

export const createRequestClientDataThings = <TLang extends string>({ langs }: { langs?: TLang[] } = {}) => {
  const applyRequestClientDataToExpressApp = ({ expressApp }: { expressApp: Express }) => {
    expressApp.use((req, res, next) => {
      const clientData = getClientDataByRequest({ req, langs })
      ;(req as any).clientData = clientData
      next()
    })
  }

  return {
    applyRequestClientDataToExpressApp,
    getClientDataByRequest: (req: LikeRequest) => getClientDataByRequest({ req, langs }),
  }
}

export type RequestClientDataObject<TRequestClientData extends ReturnType<typeof getClientDataByRequest>> = {
  clientData: TRequestClientData
}
