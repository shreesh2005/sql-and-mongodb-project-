import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Users, FileText, ShoppingCart, Folder, FileQuestion } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  const { vendors = [], parts = [], pos = [], documents = [] } = results || {};
  const totalResults = vendors.length + parts.length + pos.length + documents.length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Global Search Results</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Found {totalResults} matches for query: <span className="font-bold text-blue-600 dark:text-blue-400">"{query}"</span>
        </p>
      </div>

      {totalResults === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center space-y-2">
          <FileQuestion size={48} className="text-gray-300" />
          <h3 className="font-semibold text-gray-700 dark:text-slate-300">No matches found</h3>
          <p className="text-xs text-gray-400">Try searching for other terms like 'Tata', 'RM-001', or 'PO-2024'.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendors */}
          {vendors.length > 0 && (
            <Card>
              <CardHeader className="bg-gray-50/50 dark:bg-slate-800/20 py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Users size={16} className="text-blue-500" /> Matched Vendors ({vendors.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 divide-y dark:divide-slate-800">
                {vendors.map(v => (
                  <div key={v.vendor_code} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                    <Link to="/vendors" className="font-bold text-blue-600 hover:underline">{v.vendor_name}</Link>
                    <p className="text-gray-500 mt-0.5">Code: {v.vendor_code} | City: {v.city || '—'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Parts */}
          {parts.length > 0 && (
            <Card>
              <CardHeader className="bg-gray-50/50 dark:bg-slate-800/20 py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><ShoppingCart size={16} className="text-emerald-500" /> Matched Parts ({parts.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 divide-y dark:divide-slate-800">
                {parts.map(p => (
                  <div key={p.part_no} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                    <Link to="/inventory" className="font-bold text-emerald-600 hover:underline">{p.description}</Link>
                    <p className="text-gray-500 mt-0.5">Part No: {p.part_no} | Standard Rate: {formatCurrency(p.unit_rate)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* POs */}
          {pos.length > 0 && (
            <Card>
              <CardHeader className="bg-gray-50/50 dark:bg-slate-800/20 py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><FileText size={16} className="text-purple-500" /> Matched Purchase Orders ({pos.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 divide-y dark:divide-slate-800">
                {pos.map(po => (
                  <div key={po.po_number} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                    <Link to="/purchase-orders" className="font-bold text-purple-600 hover:underline">{po.po_number}</Link>
                    <p className="text-gray-500 mt-0.5">Vendor Link: {po.vendor_code} | Total Value: {formatCurrency(po.total_amount)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <Card>
              <CardHeader className="bg-gray-50/50 dark:bg-slate-800/20 py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Folder size={16} className="text-amber-500" /> Matched Documents ({documents.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 divide-y dark:divide-slate-800">
                {documents.map(doc => (
                  <div key={doc._id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                    <Link to="/documents" className="font-bold text-amber-600 hover:underline">{doc.filename}</Link>
                    <p className="text-gray-500 mt-0.5">Category: {doc.documentType} | Assoc Ref: {doc.referenceId}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
