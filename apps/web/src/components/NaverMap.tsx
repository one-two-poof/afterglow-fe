"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const MAP_SRC = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_KEY_ID}`;

export default function NaverMap() {
  const mapEl = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !mapEl.current) {
      return;
    }

    const map = new naver.maps.Map(mapEl.current, {
      center: new naver.maps.LatLng(37.5665, 126.978),
      zoom: 15,
    });

    const marker = new naver.maps.Marker({
      position: map.getCenter(),
      map,
    });

    return () => {
      marker.setMap(null);
      map.destroy();
    };
  }, [ready]);

  return (
    <>
      <Script
        src={MAP_SRC}
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={mapEl} className="h-full w-full" />
    </>
  );
}
