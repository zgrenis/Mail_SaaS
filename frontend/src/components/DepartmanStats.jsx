import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectEmails } from '../store/authSlice';
import { Chart } from 'chart.js/auto';

export default function DepartmentStats() {
  const emails = useSelector(selectEmails);
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  // Verileri departmanlara göre grupla (sadece toplam sayıyı sayıyoruz)
  const stats = emails.reduce((acc, e) => {
    const d = e.department || 'Bilinmiyor';
    if (!acc[d]) acc[d] = { total: 0 };
    acc[d].total++;
    return acc;
  }, {});

  const depts = Object.keys(stats);
  const grandTotal = emails.length;

  // Grafiğin daha şık durması için departmanları mail sayısına göre büyükten küçüğe sıralıyoruz
  depts.sort((a, b) => stats[b].total - stats[a].total);

  useEffect(() => {
    if (!chartRef.current || !depts.length) return;
    if (instanceRef.current) instanceRef.current.destroy();

    instanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: depts,
        datasets: [
          {
            label: 'Mail Sayısı',
            data: depts.map(d => stats[d].total),
            backgroundColor: '#378ADD',
            borderColor: '#185FA5',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y', // Grafiği yatay yapar
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterBody: (items) => {
                const dept = items[0].label;
                const count = stats[dept].total;
                const percentage = grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0;
                return `Genel İçindeki Payı: %${percentage}`;
              },
            },
          },
        },
        scales: {
          x: { 
            beginAtZero: true, 
            ticks: { stepSize: 1 } 
          },
          y: { 
            ticks: { autoSkip: false }, 
            grid: { display: false } 
          },
        },
      },
    });

    return () => instanceRef.current?.destroy();
  }, [emails, depts, stats, grandTotal]);

  if (!emails.length) return null;

  return (
    <div className="w-full space-y-6">

      {/* Grafik Alanı */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800">Departmanlara Göre Dağılım</h3>
          <p className="text-sm text-gray-500">Hangi departmanın toplam mailler içinde ne kadar yer kapladığı</p>
        </div>
        <div className="relative h-[300px]">
          <canvas ref={chartRef} role="img" aria-label="Departmanlara göre mail istatistikleri" />
        </div>
      </div>

      {/* Detay Tablosu */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Departman</th>
              <th className="px-6 py-4 text-right">Mail Sayısı</th>
              <th className="px-6 py-4 text-right">Genel Payı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {depts.map((d) => {
              const count = stats[d].total;
              const percentage = grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0;
              
              return (
                <tr key={d} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 font-medium">{d}</td>
                  <td className="px-6 py-4 text-right text-gray-600 font-semibold">{count}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      %{percentage}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}