import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Button } from './button'
import { Icon } from './icon'

// Leaflet's default marker icons reference image files by relative URL,
// which breaks under Vite's bundling - point them at the packaged assets
// directly so the pin actually renders instead of showing a broken image.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export interface PickedLocation {
  label: string
  latitude: number
  longitude: number
}

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    )
    if (!res.ok) throw new Error('reverse geocode failed')
    const data = (await res.json()) as { display_name?: string }
    return data.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: PickedLocation | null
  onChange: (location: PickedLocation) => void
}) {
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.latitude, lng: value.longitude } : null
  )
  const [label, setLabel] = useState(value?.label ?? '')
  const [loadingLabel, setLoadingLabel] = useState(false)

  const startCenter: [number, number] = pin ? [pin.lat, pin.lng] : [49.2827, -123.1207] // Vancouver

  async function handlePick(lat: number, lng: number) {
    setPin({ lat, lng })
    setLoadingLabel(true)
    const name = await reverseGeocode(lat, lng)
    setLabel(name)
    setLoadingLabel(false)
  }

  function handleUse() {
    if (!pin) return
    onChange({ label, latitude: pin.lat, longitude: pin.lng })
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Icon name="location_on" className="size-4" />
            {value ? 'Change pin' : 'Pin on map'}
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Popup className="card-elevated fixed top-1/2 left-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 border border-border bg-card p-4">
          <p className="font-heading text-lg">Pin a location</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Tap anywhere on the map to drop a pin.
          </p>

          <div className="h-64 w-full overflow-hidden border border-border">
            <MapContainer
              center={startCenter}
              zoom={pin ? 13 : 10}
              className="h-full w-full"
              key={open ? 'open' : 'closed'}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickCapture onPick={handlePick} />
              {pin && <Marker position={[pin.lat, pin.lng]} icon={defaultIcon} />}
            </MapContainer>
          </div>

          <p className="mt-3 min-h-5 text-sm text-foreground">
            {loadingLabel ? 'Looking up address…' : pin ? label : 'No pin yet.'}
          </p>

          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" disabled={!pin || loadingLabel} onClick={handleUse}>
              Use this location
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
