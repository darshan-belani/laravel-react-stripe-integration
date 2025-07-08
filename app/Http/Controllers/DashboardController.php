<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $page = $request->input('page', 1);
        $perPage = 5;

        // Fetch more than needed and slice manually (Stripe API doesn't support page numbers)
        $stripeTransactions = PaymentIntent::all([
            'limit' => 100, // Fetch max and slice later (Stripe doesn't support pagination offset)
            'customer' => Auth::user()?->stripe_id,
        ]);

        $allData = collect($stripeTransactions->data)->map(fn($txn) => [
            'id' => $txn->id,
            'amount' => $txn->amount / 100,
            'currency' => strtoupper($txn->currency),
            'status' => $txn->status,
            'created' => date('Y-m-d H:i:s', $txn->created),
        ]);

        // Manual pagination
        $sliced = $allData->slice(($page - 1) * $perPage, $perPage)->values();
        $paginated = new LengthAwarePaginator(
            $sliced,
            $allData->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Dashboard', [
            'auth' => ['user' => Auth::user()],
            'transactions' => $paginated,
        ]);
    }
}
