import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Pricing({ auth }) {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState(null);

    const handleGoToCheckout = () => {
        if (!amount || amount < 1) {
            setError('Please enter a valid amount (minimum $1)');
            return;
        }
        setError(null);
        Inertia.get('/checkout', { amount });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Make a Payment</h2>}
        >
            <Head title="Pricing" />
            <div className="py-12 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-3xl font-bold mb-6 text-center text-blue-600">Custom Payment</h3>
                            <p className="text-center mb-8 text-gray-600">
                                Enter the amount you wish to pay and proceed to enter your card details.
                            </p>
                            <div className="max-w-md mx-auto">
                                <div className="mb-6">
                                    <label className="block text-gray-700 font-bold mb-2" htmlFor="amount">
                                        Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount (e.g., 10)"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                        required
                                    />
                                    {error && <p className="text-red-500 mt-2">{error}</p>}
                                </div>
                                <button
                                    onClick={handleGoToCheckout}
                                    className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
