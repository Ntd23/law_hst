<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use App\Models\contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactUsController extends Controller
{
    public function index(Request $request)
    {
        $query = contact::with('user:id,name,email,avatar,type');

        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('phone', 'like', "%{$searchTerm}%")
                  ->orWhere('subject', 'like', "%{$searchTerm}%")
                  ->orWhere('message', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        $query->orderBy('created_at', 'desc');

        // Handle pagination with validation
        $perPage = $request->input('per_page', 10);
        if (!is_numeric($perPage) || $perPage < 1 || $perPage > 100) {
            $perPage = 10;
        }
        
        $contacts = $query->paginate($perPage)->withQueryString();

        // Check if accounts already exist for each contact
        $emails = $contacts->getCollection()->pluck('email')->filter()->unique()->toArray();
        $phones = $contacts->getCollection()->pluck('phone')->filter()->unique()->toArray();

        $existingEmails = [];
        if (!empty($emails)) {
            $clientEmails = Client::whereIn('email', $emails)->pluck('email')->toArray();
            $userEmails = User::whereIn('email', $emails)->pluck('email')->toArray();
            $existingEmails = array_unique(array_merge($clientEmails, $userEmails));
        }

        $existingPhones = [];
        if (!empty($phones)) {
            $existingPhones = Client::whereIn('phone', $phones)->pluck('phone')->toArray();
        }

        $contacts->getCollection()->transform(function ($c) use ($existingEmails, $existingPhones) {
            $hasAccount = false;
            if (!empty($c->email) && in_array($c->email, $existingEmails)) {
                $hasAccount = true;
            } elseif (!empty($c->phone) && in_array($c->phone, $existingPhones)) {
                $hasAccount = true;
            }
            $c->has_account = $hasAccount;
            return $c;
        });

        $lawyers = User::where(function($q) {
                $q->whereNull('status')->orWhere('status', 1)->orWhere('status', 'active');
            })
            ->where(function($q) {
                $q->where('type', '!=', 'client')->orWhereNull('type');
            })
            ->select('id', 'name', 'email')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('contact-us/index', [
            'contacts' => $contacts,
            'lawyers' => $lawyers,
            'filters' => $request->only(['search', 'status', 'user_id', 'per_page', 'page']),
        ]);
    }

    public function show(contact $contact)
    {
        $contact->load('user:id,name,email,avatar,type');

        $hasAccount = false;
        if (!empty($contact->email)) {
            $hasAccount = Client::where('email', $contact->email)->exists() || User::where('email', $contact->email)->exists();
        }
        if (!$hasAccount && !empty($contact->phone)) {
            $hasAccount = Client::where('phone', $contact->phone)->exists();
        }
        $contact->has_account = $hasAccount;

        return Inertia::render('contact-us/show', [
            'contact' => $contact,
        ]);
    }

    public function updateStatus(Request $request, contact $contact)
    {
        $request->validate([
            'status' => 'required|string|in:pending,contacted,resolved,cancelled',
        ]);

        $contact->update([
            'status' => $request->status,
        ]);

        return back()->with('success', __('Trạng thái liên hệ đã được cập nhật thành công.'));
    }

    public function destroy(contact $contact)
    {
        $contact->delete();

        return back()->with('success', __('Contact message deleted successfully.'));
    }
}
