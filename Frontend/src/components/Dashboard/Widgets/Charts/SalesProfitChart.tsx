import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { item: '1964-W', sales: 20, profit: 80, color: '#10B981' },
  { item: '76680-A', sales: 15, profit: 60, color: '#3B82F6' },
  { item: '1976-W', sales: 25, profit: 90, color: '#8B5CF6' },
  { item: '1996-S', sales: 18, profit: 70, color: '#F59E0B' },
  { item: '1985-X', sales: 12, profit: 45, color: '#EF4444' },
  { item: '2000-Y', sales: 30, profit: 95, color: '#06B6D4' },
];

const SalesProfitChart: React.FC = () => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sales & Profit, Items
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="sales" 
              name="Sales" 
              domain={[0, 35]}
              tickFormatter={(value) => `${value}K`}
            />
            <YAxis 
              type="number" 
              dataKey="profit" 
              name="Profit" 
              domain={[0, 100]}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [
                name === 'sales' ? `${value}K` : value,
                name === 'sales' ? 'Sales' : 'Profit'
              ]}
              labelFormatter={(label) => `Item: ${label}`}
            />
            <Scatter dataKey="profit" data={data}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.item}</span>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">${item.sales}K</div>
              <div className="text-xs text-gray-500">Profit: {item.profit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesProfitChart; 