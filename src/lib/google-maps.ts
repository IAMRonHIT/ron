/* Google Maps helpers: dynamic loader + geocoding, places, directions */

declare global {
  interface Window { google: any }
}

export async function loadGoogleMaps(libraries: string[] = ["maps","marker","geometry","places"]) {
  // Prefer NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; fall back to GOOGLE_MAPS_API_KEY
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || (process as any).env?.GOOGLE_MAPS_API_KEY
  if (!apiKey) throw new Error("Missing Google Maps API key")

  if (!(window as any).google || !(window as any).google.maps) {
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`
    script.async = true
    document.head.appendChild(script)
    await new Promise((res) => (script.onload = res))
  }

  // Preload requested libraries
  const loaded: Record<string, any> = {}
  for (const lib of libraries) {
    loaded[lib] = await (window as any).google.maps.importLibrary(lib)
  }
  return loaded
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; placeId?: string } | null> {
  await loadGoogleMaps(["maps"]) // geocoder is in core
  const geocoder = new (window as any).google.maps.Geocoder()
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results: any, status: string) => {
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location
        resolve({ lat: loc.lat(), lng: loc.lng(), placeId: results[0].place_id })
      } else {
        resolve(null)
      }
    })
  })
}

export async function nearbySearch(params: any): Promise<any[]> {
  const libs = await loadGoogleMaps(["places"]) // ensure places
  const container = document.createElement('div')
  const service = new (window as any).google.maps.places.PlacesService(container)
  return new Promise((resolve, reject) => {
    service.nearbySearch(params, (results: any[], status: string) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) resolve(results)
      else reject(new Error(status))
    })
  })
}

export async function textSearch(params: any): Promise<any[]> {
  await loadGoogleMaps(["places"]) // ensure places
  const container = document.createElement('div')
  const service = new (window as any).google.maps.places.PlacesService(container)
  return new Promise((resolve, reject) => {
    service.textSearch(params, (results: any[], status: string) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) resolve(results)
      else reject(new Error(status))
    })
  })
}

export async function routeDirections(
  origin: any,
  destination: any,
  travelMode: any = (window as any).google?.maps?.TravelMode?.DRIVING || 'DRIVING'
): Promise<any> {
  await loadGoogleMaps(["routes"]) // directions in core
  const service = new (window as any).google.maps.DirectionsService()
  return new Promise((resolve, reject) => {
    service.route({ origin, destination, travelMode }, (result: any, status: string) => {
      if (status === "OK") resolve(result)
      else reject(new Error(status))
    })
  })
}

export function externalDirectionsUrl(dest: { lat?: number; lng?: number; placeId?: string; address?: string }) {
  if (dest.placeId) return `https://www.google.com/maps/dir/?api=1&destination_place_id=${encodeURIComponent(dest.placeId)}`
  if (dest.lat != null && dest.lng != null) return `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`
  if (dest.address) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest.address)}`
  return "https://www.google.com/maps"
}


