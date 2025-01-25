import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartConfig {
  type: "BarChart" | "LineChart" | "PieChart";
  title: string;
  data: Array<{ [key: string]: any }>;
  xKey: string;
  yKey: string;
}

interface DynamicChartProps {
  chartConfig: ChartConfig;
}

export const chartColour = [
  "#FF6633",
  "#FFB399",
  "#FF33FF",
  "#FFFF99",
  "#00B3E6",
  "#E6B333",
  "#3366E6",
  "#999966",
  "#99FF99",
  "#B34D4D",
  "#80B300",
  "#809900",
  "#E6B3B3",
  "#6680B3",
  "#66991A",
  "#FF99E6",
  "#CCFF1A",
  "#FF1A66",
  "#E6331A",
  "#33FFCC",
  "#66994D",
  "#B366CC",
  "#4D8000",
  "#B33300",
  "#CC80CC",
  "#66664D",
  "#991AFF",
  "#E666FF",
  "#4DB3FF",
  "#1AB399",
  "#E666B3",
  "#33991A",
  "#CC9999",
  "#B3B31A",
  "#00E680",
  "#4D8066",
  "#809980",
  "#E6FF80",
  "#1AFF33",
  "#999933",
  "#FF3380",
  "#CCCC00",
  "#66E64D",
  "#4D80CC",
  "#9900B3",
  "#E64D66",
  "#4DB380",
  "#FF4D4D",
  "#99E6E6",
  "#6666FF",
];

export const DynamicChart: React.FC<DynamicChartProps> = ({ chartConfig }) => {
  if (!chartConfig) {
    return <p>No data available for visualization.</p>;
  }

  const { type, title, data, xKey, yKey } = chartConfig;

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <>
              {type === "BarChart" && (
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={yKey} fill="#82ca9d" />
                </BarChart>
              )}
              {type === "LineChart" && (
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={yKey} stroke="#8884d8" />
                </LineChart>
              )}
              {type === "PieChart" && (
                <PieChart>
                  <Pie
                    data={data}
                    dataKey={yKey}
                    nameKey={xKey}
                    fill="#82ca9d"
                    label
                  />
                  <Tooltip />
                </PieChart>
              )}
            </>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
