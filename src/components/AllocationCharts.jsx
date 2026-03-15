import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ChartTooltip } from 'recharts';
import { getAssetClassColor } from '../utils/assetClasses';

// Neutral, accessible palette — no rainbow
const COLORS = ['#171717', '#525252', '#737373', '#A3A3A3', '#D4D4D4'];

function AllocationCharts({ positions, viewMode, groupedPositions }) {
  const displayPositions = viewMode === 'asset-classes' ? groupedPositions : positions;

  // Prepare data for current allocation
  const currentData = displayPositions.map((pos, index) => ({
    name: viewMode === 'asset-classes' ? pos.assetClass : pos.ticker,
    value: parseFloat(pos.currentPercent.toFixed(2)),
    amount: pos.currentAmount,
    color: viewMode === 'asset-classes' ? getAssetClassColor(pos.assetClass) : COLORS[index % COLORS.length]
  }));

  // Prepare data for target allocation
  const targetData = displayPositions.map((pos, index) => ({
    name: viewMode === 'asset-classes' ? pos.assetClass : pos.ticker,
    value: parseFloat(pos.targetPercent.toFixed(2)),
    amount: pos.targetAmount,
    color: viewMode === 'asset-classes' ? getAssetClassColor(pos.assetClass) : COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-md p-3 text-sm shadow-md">
          <p className="font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-muted-foreground text-xs mt-0.5" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>
            {payload[0].value}% (${payload[0].payload.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if slice is too small

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const charts = [
    { title: 'Current Allocation', data: currentData },
    { title: 'Target Allocation', data: targetData }
  ].map(({ title, data }) => (
    <div key={title} className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h3 className="text-base font-semibold text-foreground mb-4 text-center">
        {title}
      </h3>
      <div className="w-full" style={{ minHeight: '300px', height: '300px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  {value} ({entry.payload.value}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 my-6 md:my-8">
      {charts}
    </div>
  );
}

export default AllocationCharts;
