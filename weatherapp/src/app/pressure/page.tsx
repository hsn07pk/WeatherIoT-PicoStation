"use client";
import { useEffect, useState } from "react";
import { InfluxDB } from "@influxdata/influxdb-client";
import Link from "next/link";

const INFLUX_URL = process.env.NEXT_PUBLIC_INFLUXDB_URL || "";
const INFLUX_TOKEN = process.env.NEXT_PUBLIC_INFLUXDB_TOKEN || "";
const INFLUX_ORG = process.env.NEXT_PUBLIC_INFLUXDB_ORG || "";
const BUCKET = "IotWeather";

const fluxQuery = `
  from(bucket: "${BUCKET}")
    |> range(start: -3h)
    |> filter(fn: (r) => r._measurement == "mqtt_consumer")
    |> filter(fn: (r) => r._field == "pressure" )
    |> aggregateWindow(every: 30s, fn: mean, createEmpty: false)
    |> yield(name: "mean_values")
`;

export default function Dashboard() {
  const [data, setData] = useState<{ time: string; field: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const client = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN }).getQueryApi(INFLUX_ORG);

      const results: { time: string; field: string; value: number }[] = [];

      try {
        for await (const { values, tableMeta } of client.iterateRows(fluxQuery)) {
          const row = tableMeta.toObject(values);
          results.push({
            time: row._time,
            field: row._field,
            value: row._value,
          });
        }

        setData(results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
        <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
          <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
          <Link href="/"><span className="">Pressure Log</span></Link> 
          </div>
        </div>
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="flex flex-col items-center">
          <thead>
            <tr className="">
              <th className="px-4 ">Time</th>
              <th className=" ">Pressure</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{new Date(row.time).toLocaleTimeString()}</td>
                <td className="px-4">{row.value} Pa</td>
              </tr>
            ))}
          </tbody>
        </table>

        // <CardDemo />
      )}
    </div>
  );
}
