"use client"

import { useEffect, useMemo, useRef } from "react"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ProviderSearchResult } from "@/lib/types"
import { lightMapStyle, darkMapStyle } from "@/lib/mapStyles"

type ProviderWithCoords = ProviderSearchResult & { lat?: number; lng?: number }

interface ProviderMapProps {
  providers: ProviderWithCoords[]
  center?: { lat: number; lng: number }
  theme?: "light" | "dark"
  onSelect?: (provider: ProviderWithCoords) => void
}

declare global {
  interface Window { google: any }
}

export function ProviderMap({ providers, center, theme = "light", onSelect }: ProviderMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObj = useRef<any>(null)
  const markers = useRef<any[]>([])

  const mapStyle = useMemo(() => (theme === "dark" ? darkMapStyle : lightMapStyle), [theme])

  useEffect(() => {
    if (!mapRef.current) return

    async function init() {
      // Load Google Maps JS API dynamically using the new importLibrary pattern
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || (process as any).env?.GOOGLE_MAPS_API_KEY
      if (!apiKey) return

      if (!(window as any).google || !(window as any).google.maps) {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker,geometry,places` 
        script.async = true
        document.head.appendChild(script)
        await new Promise((res) => (script.onload = res))
      }

      const { Map } = await (window as any).google.maps.importLibrary("maps")
      const { AdvancedMarkerElement } = await (window as any).google.maps.importLibrary("marker")

      mapObj.current = new Map(mapRef.current, {
        center: center || { lat: providers?.[0]?.lat ?? 40.7608, lng: providers?.[0]?.lng ?? -111.8910 },
        zoom: 11,
        mapId: "ronai-map",
        disableDefaultUI: true,
        gestureHandling: "greedy",
        styles: mapStyle,
      })

      // Clear any existing markers
      markers.current.forEach(m => m.map = null as any)
      markers.current = []

      // Add provider markers
      providers?.forEach((p) => {
        if (p.lat == null || p.lng == null) return
        const marker = new (AdvancedMarkerElement as any)({
          map: mapObj.current!,
          position: { lat: p.lat, lng: p.lng },
          title: `${p.name} • ${p.specialty}`,
        })
        ;(marker as any).addListener?.("gmp-click", () => onSelect && onSelect(p))
        markers.current.push(marker)
      })
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, center, theme])

  return (
    <Card className="overflow-hidden rounded-2xl border-border/40">
      <div ref={mapRef} className="h-[360px] w-full bg-muted relative">
        {!providers?.length && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MapPin className="w-10 h-10 mx-auto mb-3" />
              <p>No providers to plot yet</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
