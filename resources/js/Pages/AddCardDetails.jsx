import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';


function PaymentForm({ amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const { props } = usePage();
    const user = props.auth?.user || {};

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements || !name || !amount) {
            setError('Please fill in all fields and ensure an amount is provided.');
            setProcessing(false);
            return;
        }
        try {
            const response = await axios.post('/create-payment-intent', {
                name,
                amount
            });
            const clientSecret = response.data.clientSecret;

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement), // ✅ FIXED: pass only CardNumberElement
                    billing_details: {
                        name: name,
                        email: user.email || '',
                    },
                },
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            await axios.post('/confirm-payment', { payment_intent_id: paymentIntent.id });

            window.location.href = '/payment/success';
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    const elementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Amount ($)</label>
                <input
                    type="number"
                    value={amount || '10'}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Cardholder Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Card Number</label>
                <div className="border p-3 rounded-lg">
                    <CardNumberElement options={elementOptions} />
                </div>
            </div>

            <div className="mb-6 flex gap-4">
                <div className="w-1/2">
                    <label className="block text-gray-700 font-bold mb-2">Expiry Date</label>
                    <div className="border p-3 rounded-lg">
                        <CardExpiryElement options={elementOptions} />
                    </div>
                </div>
                <div className="w-1/2">
                    <label className="block text-gray-700 font-bold mb-2">CVC</label>
                    <div className="border p-3 rounded-lg">
                        <CardCvcElement options={elementOptions} />
                    </div>
                </div>
            </div>

            {error && <div className="text-red-500 mb-6">{error}</div>}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-gray-400"
            >
                {processing ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
}

export default function AddCardDetails({ auth, stripe_key, amount }) {
    const stripePromise = loadStripe(stripe_key);
    return (
        <AuthenticatedLayout
            user={auth?.user || null}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add Card Details</h2>}
        >
            <Head title="Add Card Details" />
            <div className="py-12 bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-3xl font-bold mb-6 text-center text-blue-600">Enter Payment Details</h3>
                            {!auth?.user && (
                                <p className="text-red-500 text-center mb-6">Please log in to continue with payment.</p>
                            )}
                            <Elements stripe={stripePromise}>
                                <PaymentForm amount={amount} />
                            </Elements>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
