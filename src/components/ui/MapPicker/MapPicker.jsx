import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapPicker.css'

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TUNISIA_CENTER = [33.8869, 9.5375]

function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyTo({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 15, { duration: 1 })
  }, [lat, lng, map])
  return null
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { 'Accept-Language': 'fr' } },
    )
    const data = await res.json()
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

function MapPicker({ address, onAddressChange }) {
  const [center, setCenter] = useState(TUNISIA_CENTER)
  const [marker, setMarker] = useState(null)
  const [search, setSearch] = useState(address || '')
  const [geoLoading, setGeoLoading] = useState(false)

  useEffect(() => {
    if (address && !marker) setSearch(address)
  }, [address])

  const handleLocationSelect = useCallback(async (lat, lng) => {
    setMarker([lat, lng])
    setGeoLoading(true)
    const addr = await reverseGeocode(lat, lng)
    setSearch(addr)
    onAddressChange(addr)
    setGeoLoading(false)
  }, [onAddressChange])

  const handleSearch = useCallback(async () => {
    if (!search.trim()) return
    setGeoLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1&accept-language=fr`,
        { headers: { 'Accept-Language': 'fr' } },
      )
      const data = await res.json()
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0]
        setCenter([parseFloat(lat), parseFloat(lon)])
        setMarker([parseFloat(lat), parseFloat(lon)])
        setSearch(display_name)
        onAddressChange(display_name)
      }
    } catch { /* ignore */ }
    setGeoLoading(false)
  }, [search, onAddressChange])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSearch() }
  }

  return (
    <div className="map-picker">
      <div className="map-search-bar">
        <input
          type="text"
          className="map-search-input"
          placeholder="Rechercher une adresse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="map-search-btn" onClick={handleSearch} disabled={geoLoading}>
          {geoLoading ? '...' : '🔍'}
        </button>
      </div>

      <div className="map-container">
        <MapContainer center={center} zoom={6} className="map-leaflet">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onLocationSelect={handleLocationSelect} />
          {marker && (
            <Marker
              position={marker}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng()
                  handleLocationSelect(lat, lng)
                },
              }}
            />
          )}
          {marker && <FlyTo lat={marker[0]} lng={marker[1]} />}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapPicker
