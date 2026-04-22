import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmails, resolveComplaint, selectEmails, selectEmailsLoading, selectEmailsError } from '../store/authSlice';

const PAGE_SIZE = 5;

export default function EmailsTable() {
  const dispatch = useDispatch();
  const emails = useSelector(selectEmails);
  const loading = useSelector(selectEmailsLoading);
  const error = useSelector(selectEmailsError);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchEmails());
  }, [dispatch]);

  if (loading) return <p className="text-center text-gray-500 py-8">Yükleniyor...</p>;
  if (error)   return <p className="text-center text-red-500 py-8">{error}</p>;
  if (!emails.length) return <p className="text-center text-gray-400 py-8">Henüz mail bulunmuyor.</p>;

  const totalPages = Math.ceil(emails.length / PAGE_SIZE);
  const paginated = emails.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="w-full space-y-3">
      <div className="w-full rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 w-[8%]">Message ID</th>
              <th className="px-4 py-3 w-[8%]">Konu</th>
              <th className="px-4 py-3 w-[6%]">Departman</th>
              <th className="px-4 py-3 w-[20%]">Mail</th>
              <th className="px-4 py-3 w-[10%]">İşlenme Tarihi</th>
              <th className="px-4 py-3 w-[25%]">Düzeltilmiş Mail</th>
              <th className="px-4 py-3 w-[10%]">Şikayet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((email) => (
              <tr key={email.message_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs break-all">{email.message_id}</td>
                <td className="px-4 py-3 font-medium text-gray-800 break-words">{email.subject}</td>
                <td className="px-4 py-3 text-gray-600 break-words">{email.department}</td>
                <td className="px-4 py-3 text-gray-600 break-all">{email.mail}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(email.processed_at).toLocaleString('tr-TR')}
                </td>
                <td className="px-4 py-3 text-gray-600 break-words">{email.processed}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => dispatch(resolveComplaint(email.message_id))}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors w-full cursor-pointer ${
                      email.complaint
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {email.complaint ? 'Şikayet Var' : 'Şikayet Yok'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-500">
          Toplam <span className="font-medium">{emails.length}</span> mail —{' '}
          Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Önceki
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                page === currentPage
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sonraki
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}