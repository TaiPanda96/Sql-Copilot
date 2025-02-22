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
  Cell,
} from "recharts";

export const enum ChartType {
  BarChart = "BarChart",
  LineChart = "LineChart",
  PieChart = "PieChart",
}

interface ChartConfig {
  type: ChartType;
  title: string;
  data: Array<{ [key: string]: any }>;
  xKey: string;
  yKey: string;
}

interface DynamicChartProps {
  chartConfig: ChartConfig;
}

const barChartColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d8c4b3"];
const pieChartColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const DynamicChart: React.FC<DynamicChartProps> = ({ chartConfig }) => {
  if (!chartConfig) {
    return <p>No data available for visualization.</p>;
  }

  const { type, title, data, xKey, yKey } = chartConfig;

  // Chart rendering logic encapsulated in a mapping object
  const chartRenderers: Record<ChartType, JSX.Element> = {
    [ChartType.BarChart]: (
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey={yKey}
          fill={
            barChartColors[Math.floor(Math.random() * barChartColors.length)]
          }
        />
      </BarChart>
    ),
    [ChartType.LineChart]: (
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yKey} stroke="#8884d8" />
      </LineChart>
    ),
    [ChartType.PieChart]: (
      <PieChart>
        <Pie data={data} dataKey={yKey} nameKey={xKey} label>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={pieChartColors[index % pieChartColors.length]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    ),
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartRenderers[type] || <p>Unsupported chart type</p>}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
