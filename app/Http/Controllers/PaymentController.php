<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Customer;

class PaymentController extends Controller
{

    public function index()
    {
        return Inertia::render('Pricing', [
            'auth' => Auth::user() ? ['user' => Auth::user()] : ['user' => null],
        ]);
    }

    public function checkout(Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $amount = $request->input('amount', '');

        return Inertia::render('AddCardDetails', [
            'stripe_key' => config('services.stripe.key'),
            'amount' => $amount ? (float) $amount : null,
            'auth' => ['user' => Auth::user()],
        ]);
    }

    public function createPaymentIntent(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $user = Auth::user();
        $amount = $request->input('amount'); // Already in dollars

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            // Create or retrieve Stripe customer
            if (!$user->stripe_id) {
                $customer = Customer::create([
                    'email' => $user->email,
                    'name' => $user->name,
                ]);
                $user->stripe_id = $customer->id;
                $user->save();
            }

            // Create Payment Intent (without confirm)
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount * 100, // Convert to cents only here
                'currency' => 'usd',
                'customer' => $user->stripe_id,
                'automatic_payment_methods' => [
                    'enabled' => true,
                    'allow_redirects' => 'never',
                ],
            ]);

            // Return client_secret for Stripe.js to confirm on frontend
            return response()->json([
                'clientSecret' => $paymentIntent->client_secret
            ]);
        } catch (\Exception $e) {
            \Log::error('Payment Intent Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $paymentIntent = PaymentIntent::retrieve($request->input('payment_intent_id'));

            if ($paymentIntent->status === 'succeeded') {
                // Optionally save payment details to your database
                return response()->json(['success' => true, 'redirect' => route('payment.success')]);
            }

            return response()->json(['error' => 'Payment not completed'], 400);
        } catch (\Exception $e) {
            \Log::error('Confirm Payment Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function success()
    {
        return Inertia::render('PaymentSuccess');
    }

    public function cancel()
    {
        return Inertia::render('PaymentCancel');
    }
}
