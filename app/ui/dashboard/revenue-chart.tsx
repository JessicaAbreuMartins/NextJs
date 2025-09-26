import { lusitana } from '@/app/ui/fonts';
import { CalendarIcon } from '@heroicons/react/24/outline';

export default function RevenueChartPlaceholder() {
  const chartHeight = 350;

  return (
    <div className="w-full md:col-span-4">
      {/* Título */}
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
      </h2>

      {/* Container do gráfico */}
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          {/* Quadrado vazio do gráfico */}
          <div style={{ height: `${chartHeight}px`, width: '100%' }}></div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="flex items-center pt-4">
        <h3 className="ml-2 text-sm text-gray-400"></h3>
      </div>
    </div>
  );
}
