import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jan 2015', kpi: 45, cash: 30, days: 25, days2: 15 },
  { month: 'Feb 2015', kpi: 42, cash: 28, days: 22, days2: 18 },
  { month: 'Mar 2015', kpi: 48, cash: 35, days: 28, days2: 20 },
  { month: 'Apr 2015', kpi: 50, cash: 38, days: 30, days2: 22 },
];

const CashCycleChart: React.FC = () => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cash Cycle Components BY MONTH
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 50]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="kpi" 
              stroke="#10B981" 
              strokeWidth={2}
              name="KPI_N"
            />
            <Line 
              type="monotone" 
              dataKey="cash" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Cash"
            />
            <Line 
              type="monotone" 
              dataKey="days" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Days"
            />
            <Line 
              type="monotone" 
              dataKey="days2" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Days2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Latest Month (Apr 2015):</span>
          <span className="font-medium text-gray-900">KPI: 50, Cash: 38</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Trend:</span>
          <span className="text-green-600 font-medium">↗️ Increasing</span>
        </div>
      </div>
    </div>
  );
};

export default CashCycleChart; 