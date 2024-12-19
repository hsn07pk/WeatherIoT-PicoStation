"use client";
import Link from "next/link";
import Image from "next/image";
// import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { useEffect, useState } from "react";
import { InfluxDB } from "@influxdata/influxdb-client";

const INFLUX_URL = process.env.NEXT_PUBLIC_INFLUXDB_URL || "";
const INFLUX_TOKEN = process.env.NEXT_PUBLIC_INFLUXDB_TOKEN || "";
const INFLUX_ORG = process.env.NEXT_PUBLIC_INFLUXDB_ORG || "";
const BUCKET = "IotWeather";

const queries = {
  temperature: `
    from(bucket: "${BUCKET}")
      |> range(start: -90h)
      |> filter(fn: (r) => r._measurement == "mqtt_consumer")
      |> filter(fn: (r) => r._field == "temperature")
      |> last()
  `,
  pressure: `
    from(bucket: "${BUCKET}")
      |> range(start: -90h)
      |> filter(fn: (r) => r._measurement == "mqtt_consumer")
      |> filter(fn: (r) => r._field == "pressure")
      |> last()
  `,
};

export default function Home() {
  const [temperature, setTemperature] = useState<number | null>(10);
  const [pressure, setPressure] = useState<number | null>(null);
  const [loadingTemperature, setLoadingTemperature] = useState(true);
  const [loadingPressure, setLoadingPressure] = useState(true);

  useEffect(() => {
    const client = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN }).getQueryApi(INFLUX_ORG);

    // Generic fetch function for temperature and pressure
    async function fetchData(
      query: string,
      setter: React.Dispatch<React.SetStateAction<number | null>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) {
      try {
        const results: { value: number }[] = [];
        for await (const { values, tableMeta } of client.iterateRows(query)) {
          const row = tableMeta.toObject(values);
          results.push({ value: row._value });
        }
        setter(results[0]?.value || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    // Fetch temperature and pressure concurrently
    fetchData(queries.temperature, setTemperature, setLoadingTemperature);
    fetchData(queries.pressure, setPressure, setLoadingPressure);
  }, []);

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="">
        <div>
          <BackgroundBeamsWithCollision className="flex-col">
            {loadingTemperature && loadingPressure ? (
              <p>Loading...</p>
            ) : (
              <>
                {temperature !== null && (
                  <Image
                    className="dark:invert mt-[10rem]"
                    src={temperature < 18 ? "/snow.png" : "/sun.png"}
                    alt={temperature < 18 ? "Snowy weather logo" : "Sunny weather logo"}
                    width={120}
                    height={120}
                    priority
                  />
                )}

                <h1 className="text-6xl relative mt-6 z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
                  {temperature}°
                </h1>
                <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
                  <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
                    <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
                      <span className="">Pressure: {pressure} Pa</span>
                    </div>
                  </div>
                </h2>
                <div className="flex">
                  <Link
                    className='className="relative px-6 bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4'
                    href="/temperature"
                  >
                    Past Temperatures
                  </Link>
                  <Link
                    className='className="relative px-6 bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4'
                    href="/pressure"
                  >
                  Past Pressures
                  </Link>
                </div>
              </>
            )}
          </BackgroundBeamsWithCollision>
        </div>
      </main>
    </div>
  );
}
