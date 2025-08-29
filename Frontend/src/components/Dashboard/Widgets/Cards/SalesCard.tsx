import React from 'react';
import { TrendingUp } from 'lucide-react';

const SalesCard: React.FC = () => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sales This Month</h3>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </div>
      
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900 mb-2">79K</div>
        <div className="text-sm text-gray-600">Total Sales</div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Previous Month</span>
          <span className="text-gray-900 font-medium">72K</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Growth</span>
          <span className="text-green-600 font-medium">+9.7%</span>
        </div>
      </div>
    </div>
  );
};

export default SalesCard; 