import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';

export default function Dashboard() {
    const { auth, transactions } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}>
            <Head title="Dashboard" />

            <div className="py-10 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-2xl font-bold mb-4">Stripe Transactions</h3>

                        {transactions.data.length === 0 ? (
                            <p className="text-gray-600">No transactions found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Currency</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Created</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {transactions.data.map((txn) => (
                                        <tr key={txn.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{txn.id}</td>
                                            <td className="px-4 py-2">${txn.amount.toFixed(2)}</td>
                                            <td className="px-4 py-2">{txn.currency}</td>
                                            <td className="px-4 py-2 capitalize">{txn.status}</td>
                                            <td className="px-4 py-2">{txn.created}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="mt-6 flex justify-end space-x-2">
                            {transactions.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
