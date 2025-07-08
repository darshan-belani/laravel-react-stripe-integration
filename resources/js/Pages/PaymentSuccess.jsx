import React from 'react';
import { Head } from '@inertiajs/react';

export default function PaymentSuccess() {
    return (
        <>
            <Head title="Payment Successful" />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
                    <p>Thank you for your subscription.</p>
                    <a href={route('dashboard')}
                       className="flex justify-center mt-2 w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                        Back to dashboard
                    </a>
                </div>

            </div>
        </>
    );
}
