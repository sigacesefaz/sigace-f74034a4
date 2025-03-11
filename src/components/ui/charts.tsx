import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as RechartsBarChart, Bar } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface AreaChartProps {
  data: ChartData[];
  colors: string[];
}

export function AreaChart({ data, colors }: AreaChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={colors[0]} 
            fill={colors[0]}
            fillOpacity={0.3}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarChartProps {
  data: ChartData[];
  colors: string[];
}

export function BarChart({ data, colors }: BarChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar 
            dataKey="value" 
            fill={colors[0]}
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
