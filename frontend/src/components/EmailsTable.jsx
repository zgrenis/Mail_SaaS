import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmails, resolveComplaint,
  selectEmails, selectEmailsLoading, selectEmailsError
} from '../store/authSlice';

const PAGE_SIZE = 5;

function ConfirmDialog({ email, onConfirm, onCancel }) {
  const isReporting = !email.complaint; // şu an false → true yapacağız

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-5 w-80 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            isReporting ? 'bg-red-50' : 'bg-green-50'
          }`}>
            {isReporting ? (
              <svg className="w-4 h-4 text-red-600" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 3.5a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 018 5.5zm0 6a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-green-600" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm3.03 4.47a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.97-2.97a.75.75 0 011.06 0z"/>
              </svg>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800">
            {isReporting ? 'Hata bildirimi gönderilsin mi?' : 'Bildirim geri alınsın mı?'}
          </p>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          {isReporting
            ? 'Bu mail Orbis\'e hata olarak bildirilecek. Onaylıyor musunuz?'
            : 'Bu mailin Orbis bildirimi kaldırılacak. Onaylıyor musunuz?'}
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors ${
              isReporting
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isReporting ? 'Bildir' : 'Geri Al'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmailsTable() {
  const dispatch = useDispatch();
  const emails = useSelector(selectEmails);
  const loading = useSelector(selectEmailsLoading);
  const error   = useSelector(selectEmailsError);

  const [currentPage, setCurrentPage]   = useState(1);
  const [confirmEmail, setConfirmEmail] = useState(null); // dialog için seçili mail

  useEffect(() => { dispatch(fetchEmails()); }, [dispatch]);

  const handleConfirm = () => {
    dispatch(resolveComplaint(confirmEmail.message_id));
    setConfirmEmail(null);
  };

  if (loading) return <p className="text-center text-gray-500 py-8">Yükleniyor...</p>;
  if (error)   return <p className="text-center text-red-500 py-8">{error}</p>;
  if (!emails.length) return <p className="text-center text-gray-400 py-8">Henüz mail bulunmuyor.</p>;

  const totalPages = Math.ceil(emails.length / PAGE_SIZE);
  const paginated  = emails.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      {confirmEmail && (
        <ConfirmDialog
          email={confirmEmail}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmEmail(null)}
        />
      )}

      <div className="w-full space-y-3">
        <div className="w-full rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left table-fixed">
            {/* thead aynı kalır */}
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 w-[8%]">Message ID</th>
                <th className="px-4 py-3 w-[8%]">Konu</th>
                <th className="px-4 py-3 w-[6%]">Departman</th>
                <th className="px-4 py-3 w-[20%]">Mail</th>
                <th className="px-4 py-3 w-[10%]">İşlenme Tarihi</th>
                <th className="px-4 py-3 w-[25%]">Düzeltilmiş Mail</th>
                <th className="px-4 py-3 w-[10%]">Orbis Bildirim</th>
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
                      onClick={() => setConfirmEmail(email)}   // ← artık direkt dispatch değil
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors w-full cursor-pointer ${
                        email.complaint
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {email.complaint ? 'Orbise Bildirildi' : 'Hata Bildir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination — aynı kalır */}
        <div className="flex items-center justify-between px-1">
          {/* ... mevcut kodun aynısı ... */}
        </div>
      </div>
    </>
  );
}