import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const trialBalanceData = [
  { kpi: 'Gross Margin', value: '1,300,920.00', change: '+5.2%', trend: 'up' },
  { kpi: 'Gross Margin %', value: '76.89', change: '+2.1%', trend: 'up' },
  { kpi: 'Income before Interest and Tax', value: '129,760.00', change: '+8.7%', trend: 'up' },
  { kpi: 'Operating Expenses', value: '1,171,160.00', change: '+3.4%', trend: 'up' },
  { kpi: 'Operating Margin', value: '7.67', change: '+1.2%', trend: 'up' },
  { kpi: 'Operating Margin %', value: '6.89', change: '+0.8%', trend: 'up' },
  { kpi: 'Other Expenses', value: '45,200.00', change: '-2.1%', trend: 'down' },
  { kpi: 'Total Cost', value: '1,216,360.00', change: '+2.8%', trend: 'up' },
  { kpi: 'Total Revenue', value: '1,690,680.00', change: '+6.1%', trend: 'up' },
];

const TrialBalanceTable: React.FC = () => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Trial Balance BY MONTH
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">
                KPI Name
              </th>
              <th className="text-right py-2 px-2 text-sm font-medium text-gray-700">
                Net Change Actual
              </th>
            </tr>
          </thead>
          <tbody>
            {trialBalanceData.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    {row.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span>{row.kpi}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-sm text-right">
                  <div className="text-gray-900 font-medium">{row.value}</div>
                  <div className={`text-xs ${
                    row.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {row.change}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Net Change:</span>
          <span className="text-green-600 font-bold">+$474,320.00</span>
        </div>
      </div>
    </div>
  );
};

export default TrialBalanceTable; 