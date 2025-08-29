import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { contact: 'David', value: 0.15 },
  { contact: 'Monica', value: 0.12 },
  { contact: 'Design', value: 0.10 },
  { contact: 'BYT-K', value: 0.08 },
  { contact: 'Andrea', value: 0.06 },
  { contact: 'Guildy', value: 0.05 },
  { contact: 'Minre', value: 0.04 },
  { contact: 'Kennet', value: 0.03 },
];

const OpportunitiesChart: React.FC = () => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Opportunities Pipeline BY CONTACT
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={[0, 0.2]}
              tickFormatter={(value) => `${value}M`}
            />
            <YAxis 
              type="category" 
              dataKey="contact" 
              width={80}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`$${value}M`, 'Value']}
              labelFormatter={(label) => `Contact: ${label}`}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Total Pipeline:</span>
          <span className="font-medium">$0.73M</span>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesChart; 