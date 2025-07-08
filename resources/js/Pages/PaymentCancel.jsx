import React from 'react';
import { Head } from '@inertiajs/react';

export default function PaymentCancel() {
    return (
        <>
            <Head title="Payment Cancelled" />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Payment Cancelled</h2>
                    <p>Your payment was cancelled. Please try again.</p>
                </div>
            </div>
        </>
    );
}
