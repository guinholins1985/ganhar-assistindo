import React from 'react';
import Icon from '../Icon';

interface ChartProps {
  type: 'line' | 'bar';
}

const Chart: React.FC<ChartProps> = ({ type }) => {
  return (
    <div className="h-80 w-full flex items-center justify-center bg-base-300/50 rounded-lg border-2 border-dashed border-gray-700">
        <div className="text-center text-gray-500">
            <Icon name={type === 'line' ? 'home' : 'video-camera'} className="w-12 h-12 mx-auto mb-2 opacity-50"/>
            <p className="font-semibold">Gráfico de {type === 'line' ? 'Linha' : 'Barras'}</p>
            <p className="text-xs">A visualização de dados será implementada aqui.</p>
        </div>
    </div>
  );
};

export default Chart;
