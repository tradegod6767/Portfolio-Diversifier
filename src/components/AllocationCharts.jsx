import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getAssetClassColor } from '../utils/assetClasses';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
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
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const charts = [
    { title: 'Current Allocation', data: currentData },
    { title: 'Target Allocation', data: targetData }
  ].map(({ title, data }) => (
    <div key={title} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span className="text-sm text-gray-700 font-medium">
                {value} ({entry.payload.value}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
      {charts}
    </div>
  );
}

export default AllocationCharts;
