import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { 
    month: 'Jan 2015', 
    revenue: 1.8, 
    expenses: -1.2, 
    earnings: 0.6 
  },
  { 
    month: 'Feb 2015', 
    revenue: 1.9, 
    expenses: -1.3, 
    earnings: 0.6 
  },
  { 
    month: 'Mar 2015', 
    revenue: 2.1, 
    expenses: -1.4, 
    earnings: 0.7 
  },
  { 
    month: 'Apr 2015', 
    revenue: 2.2, 
    expenses: -1.5, 
    earnings: 0.7 
  },
];

const RevenueExpensesChart: React.FC = () => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue & Expenses BY MONTH
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[-2, 2]} tickFormatter={(value) => `${value}M`} />
            <Tooltip 
              formatter={(value, name) => [
                `${value > 0 ? '+' : ''}${value}M`, 
                name === 'revenue' ? 'Total Revenue' : 
                name === 'expenses' ? 'Total Expenditure' : 'Earnings Before Interest'
              ]}
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="#F97316" 
              name="Total Revenue"
              stackId="a"
            />
            <Bar 
              dataKey="expenses" 
              fill="#EF4444" 
              name="Total Expenditure"
              stackId="b"
            />
            <Bar 
              dataKey="earnings" 
              fill="#3B82F6" 
              name="Earnings Before Interest"
              stackId="c"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Revenue (Apr):</span>
          <span className="text-orange-600 font-medium">$2.2M</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Expenses (Apr):</span>
          <span className="text-red-600 font-medium">-$1.5M</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Net Earnings (Apr):</span>
          <span className="text-blue-600 font-medium">$0.7M</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueExpensesChart; 