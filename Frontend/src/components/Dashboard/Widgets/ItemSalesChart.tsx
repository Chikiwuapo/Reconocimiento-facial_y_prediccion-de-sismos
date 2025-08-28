import React from 'react';
import { BarChart3 } from 'lucide-react';

const ItemSalesChart: React.FC = () => {
  const items = [
    { name: 'INNSBRUCK Stora...', value: 25, color: 'bg-blue-500' },
    { name: 'Bicycle', value: 20, color: 'bg-green-500' },
    { name: 'ATL', value: 18, color: 'bg-yellow-500' },
    { name: 'Side Panel', value: 15, color: 'bg-purple-500' },
    { name: 'CONTOSO', value: 12, color: 'bg-red-500' },
    { name: 'Other', value: 10, color: 'bg-gray-500' },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Item Sales Shares
      </h3>
      
      <div className="h-64">
        {/* Simplified Treemap Representation */}
        <div className="grid grid-cols-3 gap-1 h-full">
          {items.map((item, index) => (
            <div
              key={index}
              className={`${item.color} rounded flex items-center justify-center p-2 text-white text-xs font-medium relative`}
              style={{
                gridRow: index < 3 ? 'span 2' : 'span 1',
                gridColumn: index < 3 ? 'span 1' : 'span 1',
              }}
            >
              <div className="text-center">
                <div className="font-bold text-lg">{item.value}%</div>
                <div className="text-xs opacity-90">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${item.color}`} />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <span className="font-medium text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemSalesChart; 