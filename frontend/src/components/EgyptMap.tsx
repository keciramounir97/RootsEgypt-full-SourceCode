import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  Marker,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useMemo } from "react";
import L from "leaflet";
import { useTranslation } from "../context/TranslationContext";

// @ts-ignore
import icon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type RegionDef = {
  nameKey: string;
  popKey: string;
  color: string;
  coordinates: [number, number][];
};

const REGION_GEOMETRY: RegionDef[] = [
  {
    nameKey: "map_region_nile_delta",
    popKey: "map_pop_40m",
    color: "#2ecc71",
    coordinates: [
      [31.6, 30.0],
      [31.5, 30.8],
      [31.2, 31.5],
      [30.8, 31.8],
      [30.5, 31.5],
      [30.3, 31.0],
      [30.2, 30.5],
      [30.4, 30.0],
      [30.8, 29.8],
      [31.2, 29.8],
    ],
  },
  {
    nameKey: "map_region_upper_egypt",
    popKey: "map_pop_20m",
    color: "#e74c3c",
    coordinates: [
      [28.5, 30.5],
      [28.5, 31.5],
      [27.0, 31.8],
      [25.5, 32.5],
      [24.0, 33.0],
      [24.0, 32.0],
      [25.5, 31.5],
      [27.0, 30.8],
    ],
  },
  {
    nameKey: "map_region_greater_cairo",
    popKey: "map_pop_22m",
    color: "#0d9488",
    coordinates: [
      [30.3, 31.0],
      [30.3, 31.5],
      [29.8, 31.8],
      [29.7, 31.5],
      [29.7, 31.0],
      [30.0, 30.8],
    ],
  },
  {
    nameKey: "map_region_sinai",
    popKey: "map_pop_600k",
    color: "#3498db",
    coordinates: [
      [31.2, 32.3],
      [31.0, 34.0],
      [29.5, 34.8],
      [28.0, 34.5],
      [28.0, 33.5],
      [29.5, 32.5],
      [30.5, 32.3],
    ],
  },
  {
    nameKey: "map_region_nubia_aswan",
    popKey: "map_pop_5m",
    color: "#9b59b6",
    coordinates: [
      [24.0, 32.0],
      [24.0, 33.0],
      [23.0, 33.5],
      [22.0, 33.0],
      [22.0, 32.0],
      [23.0, 31.5],
    ],
  },
  {
    nameKey: "map_region_western_desert",
    popKey: "map_pop_2m",
    color: "#f39c12",
    coordinates: [
      [30.0, 25.0],
      [30.0, 29.5],
      [28.0, 30.0],
      [25.0, 30.5],
      [22.5, 30.0],
      [22.0, 27.0],
      [24.0, 25.5],
      [27.0, 25.0],
    ],
  },
  {
    nameKey: "map_region_mediterranean",
    popKey: "map_pop_8m",
    color: "#1abc9c",
    coordinates: [
      [31.8, 25.5],
      [31.8, 29.5],
      [31.4, 29.5],
      [31.0, 28.0],
      [31.0, 26.0],
      [31.4, 25.5],
    ],
  },
];

type CityDef = {
  nameKey: string;
  descKey: string;
  coords: [number, number];
};

const CITY_POINTS: CityDef[] = [
  { nameKey: "map_city_cairo", descKey: "map_city_cairo_desc", coords: [30.0444, 31.2357] },
  { nameKey: "map_city_alexandria", descKey: "map_city_alexandria_desc", coords: [31.2001, 29.9187] },
  { nameKey: "map_city_luxor", descKey: "map_city_luxor_desc", coords: [25.6872, 32.6396] },
  { nameKey: "map_city_aswan", descKey: "map_city_aswan_desc", coords: [24.0889, 32.8998] },
  { nameKey: "map_city_giza", descKey: "map_city_giza_desc", coords: [30.0131, 31.2089] },
  { nameKey: "map_city_mansoura", descKey: "map_city_mansoura_desc", coords: [31.0409, 31.3785] },
  { nameKey: "map_city_tanta", descKey: "map_city_tanta_desc", coords: [30.7865, 31.0004] },
  { nameKey: "map_city_asyut", descKey: "map_city_asyut_desc", coords: [27.1783, 31.1859] },
  { nameKey: "map_city_port_said", descKey: "map_city_port_said_desc", coords: [31.2653, 32.3019] },
  { nameKey: "map_city_faiyum", descKey: "map_city_faiyum_desc", coords: [29.3084, 30.8428] },
  { nameKey: "map_city_minya", descKey: "map_city_minya_desc", coords: [28.1099, 30.7503] },
  { nameKey: "map_city_sohag", descKey: "map_city_sohag_desc", coords: [26.5591, 31.6948] },
];

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function EgyptMap() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const egyptianRegions = useMemo(
    () =>
      REGION_GEOMETRY.map((z) => ({
        ...z,
        name: t(z.nameKey),
        population: t(z.popKey),
      })),
    [t]
  );

  const cities = useMemo(
    () =>
      CITY_POINTS.map((c) => ({
        ...c,
        name: t(c.nameKey),
        desc: t(c.descKey),
      })),
    [t]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#faf6ed]/10 flex items-center justify-center animate-pulse">
        <span className="text-white/20 text-xs uppercase tracking-widest">
          {t("map_loading", "Loading map…")}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      {/* @ts-ignore */}
      <MapContainer
        center={[27.0, 30.5]}
        zoom={6}
        zoomControl={false}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        attributionControl={false}
        className="h-full w-full bg-transparent outline-none"
        style={{ background: "#aad3df", pointerEvents: "auto" }}
      >
        <ZoomControl position="bottomright" />
        {/* @ts-ignore */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="opacity-60 grayscale-[20%]"
        />

        {egyptianRegions.map((zone) => {
          const center = zone.coordinates
            .reduce(
              (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
              [0, 0]
            )
            .map((sum) => sum / zone.coordinates.length);

          const shortLabel = zone.name.split("(")[0].trim();
          const labelIcon = L.divIcon({
            className: "custom-label-marker",
            html: `<div style="background-color: ${zone.color}; color: white; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 10px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3); width: max-content; margin-left: -50%; border: 1px solid white;">${escapeHtml(shortLabel)}</div>`,
            iconSize: [0, 0],
          });

          return (
            <div key={zone.nameKey}>
              <Polygon
                positions={zone.coordinates}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: 0.25,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-sm p-1">
                    <h4 style={{ color: zone.color }} className="font-bold mb-1">
                      {zone.name}
                    </h4>
                    <p>
                      <strong>{t("map_population_label", "Population")}:</strong> {zone.population}
                    </p>
                  </div>
                </Popup>
              </Polygon>
              {/* @ts-ignore */}
              <Marker position={center} icon={labelIcon} interactive={false} />
            </div>
          );
        })}

        {cities.map((city) => (
          <Marker key={city.nameKey} position={city.coords}>
            <Popup>
              <div className="text-sm p-1">
                <h4 className="font-bold text-[#0c4a6e]">{city.name}</h4>
                <p className="text-xs mt-1">{city.desc}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
