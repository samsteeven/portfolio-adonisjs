import type { HttpContext } from '@adonisjs/core/http'
interface LocationData {
  country?: string
  countryCode?: string
  region?: string
  regionName?: string
  city?: string
  zip?: string
  lat?: number
  lon?: number
  timezone?: string
  isp?: string
  org?: string
  status?: string
}

export default class GeolocationService {
  /**
   * Récupère les informations de géolocalisation via IP-API
   */
  static async getLocationFromIP(ipAddress: string): Promise<LocationData | null> {
    try {
      // IP-API.com permet 1000 requêtes par heure gratuitement
      const response = await fetch(`http://ip-api.com/json/${ipAddress}`)

      if (!response.ok) {
        console.warn(
          'Erreur lors de la récupération des données de géolocalisation:',
          response.status
        )
        return null
      }

      const data = (await response.json()) as LocationData

      if (data.status === 'fail') {
        console.warn("Échec de la géolocalisation pour l'IP:", ipAddress)
        return null
      }

      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        regionName: data.regionName,
        city: data.city,
        zip: data.zip,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la géolocalisation:', error)
      return null
    }
  }

  /**
   * Extrait l'adresse IP réelle du client (en tenant compte des proxies)
   */
  static extractClientIP(request: HttpContext['request']): string {
    const forwarded = request.header('x-forwarded-for')
    const realIp = request.header('x-real-ip')
    const cfConnectingIp = request.header('cf-connecting-ip') // Cloudflare

    if (cfConnectingIp) {
      return cfConnectingIp
    }

    if (forwarded) {
      // Prendre la première IP de la liste (IP du client original)
      return forwarded.split(',')[0].trim()
    }

    if (realIp) {
      return realIp
    }

    // Fallback vers l'IP de la connexion
    return request.ip()
  }

  /**
   * Anonymise partiellement une adresse IP pour la confidentialité
   */
  static anonymizeIP(ip: string): string {
    if (ip.includes(':')) {
      // IPv6 - garder seulement les 4 premiers groupes
      const parts = ip.split(':')
      return parts.slice(0, 4).join(':') + '::'
    } else {
      // IPv4 - remplacer le dernier octet par 0
      const parts = ip.split('.')
      parts[3] = '0'
      return parts.join('.')
    }
  }

  /**
   * Détermine si une IP est locale/privée
   */
  static isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^127\./, // 127.0.0.0/8
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 unique local
      /^fe80:/, // IPv6 link local
    ]

    return privateRanges.some((range) => range.test(ip))
  }

  /**
   * Récupère et traite les informations de géolocalisation complètes
   */
  static async getEnhancedLocationData(request: HttpContext['request']): Promise<{
    ip: string
    anonymizedIp: string
    location: LocationData | null
    userAgent: string | null
    referer: string | null
  }> {
    const clientIP = this.extractClientIP(request)
    const anonymizedIP = this.anonymizeIP(clientIP)

    // Ne pas faire d'appel API pour les IPs privées/locales
    let locationData: LocationData | null = null
    if (!this.isPrivateIP(clientIP)) {
      locationData = await this.getLocationFromIP(clientIP)
    }

    return {
      ip: clientIP,
      anonymizedIp: anonymizedIP,
      location: locationData,
      userAgent: request.header('user-agent')!,
      referer: request.header('referer')!,
    }
  }
}
