import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jan 2015', gross: 75.2, operating: 6.1 },
  { month: 'Feb 2015', gross: 76.1, operating: 6.3 },
  { month: 'Mar 2015', gross: 76.8, operating: 6.7 },
  { month: 'Apr 2015', gross: 76.9, operating: 6.9 },
];

const MarginsChart: React.FC = () => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Margins (%) BY MONTH
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value, name) => [
                `${value}%`, 
                name === 'gross' ? 'Gross Margin' : 'Operating Margin'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="gross" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Gross Margin"
            />
            <Line 
              type="monotone" 
              dataKey="operating" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Operating Margin"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Gross Margin (Apr):</span>
          <span className="text-green-600 font-medium">76.9%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Operating Margin (Apr):</span>
          <span className="text-purple-600 font-medium">6.9%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Trend:</span>
          <span className="text-green-600 font-medium">↗️ Both Increasing</span>
        </div>
      </div>
    </div>
  );
};

export default MarginsChart; 