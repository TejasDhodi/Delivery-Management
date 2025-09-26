"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

interface AddressInputProps {
  label: string
  onSelect: (val: { address: string; lat: number; lng: number }) => void
}

interface NominatimPlace {
    place_id: string
    licence: string
    osm_type: string
    osm_id: string
    boundingbox: [string, string, string, string]
    lat: string
    lon: string
    display_name: string
    class: string
    type: string
    importance: number
    icon?: string
  }
  

const AddressInput = ({ label, onSelect }: AddressInputProps) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimPlace[]>([])

  const handleSearch = async (value: string) => {
    setQuery(value)

    if (value.length < 3) {
      setResults([])
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}`
      )
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error("Error fetching location:", err)
    }
  }

  const handleSelect = (place: NominatimPlace) => {
    setQuery(place.display_name)
    setResults([])
    onSelect({
      address: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {results.length > 0 && (
        <ul className="border rounded max-h-40 overflow-y-auto mt-1 shadow">
          {results.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="p-2 cursor-pointer hover:bg-primary"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AddressInput
