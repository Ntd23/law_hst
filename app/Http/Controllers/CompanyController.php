<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Plan;
use App\Models\PlanOrder;
use App\Models\Setting;
use App\Models\CompanyProfile;
use App\Models\CaseModel;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->where('type', 'company')
            ->with('plan');

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Apply status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Apply date filters
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Handle sorting with validation
        $allowedSortFields = ['name', 'created_at'];
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Validate sort field
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        // Validate sort direction
        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'desc';

        $query->orderBy($sortField, $sortDirection);

        // Handle pagination with validation
        $perPage = $request->input('per_page', 10);
        if (!is_numeric($perPage) || $perPage < 1 || $perPage > 100) {
            $perPage = 10;
        }

        $companies = $query->paginate($perPage)->withQueryString();

        // Transform data for frontend
        $companies->getCollection()->transform(function ($company) {
            return [
                'id' => $company->id,
                'avatar' => $company->avatar,
                'name' => $company->name,
                'email' => $company->email,
                'status' => $company->status,
                'created_at' => $company->created_at,
                'plan_name' => $company->plan ? $company->plan->name : __('No Plan'),
                'plan_expiry_date' => $company->plan_expire_date,
            ];
        });

        // Get plans for dropdown
        $plans = Plan::all(['id', 'name']);

        return Inertia::render('companies/index', [
            'companies' => $companies,
            'plans' => $plans,
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'sort_field', 'sort_direction', 'per_page', 'view', 'page']),
        ]);
    }

    public function show(User $company)
    {
        if ($company->type !== 'company') {
            return redirect()->route('companies.index')->with('error', __('Invalid company record'));
        }

        $company->load('plan');
        $companyUserIds = getAllCompanyUsers($company->id);
        $companyAndUserIds = array_values(array_unique([...$companyUserIds, $company->id]));
        $plan = $company->getCurrentPlan();
        $storageUsedBytes = Media::whereIn('user_id', $companyAndUserIds)->sum('size');
        $storageLimitBytes = $plan?->storage_limit ? $plan->storage_limit * 1024 * 1024 * 1024 : 0;
        $profile = CompanyProfile::where('created_by', $company->id)->first();
        $settings = Setting::where('user_id', $company->id)
            ->whereIn('key', [
                'titleText',
                'footerText',
                'defaultLanguage',
                'defaultCurrency',
                'dateFormat',
                'timeFormat',
                'defaultTimezone',
            ])
            ->pluck('value', 'key');

        $paymentHistory = PlanOrder::with(['plan:id,name', 'processedBy:id,name,email'])
            ->where('user_id', $company->id)
            ->orderByDesc('ordered_at')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'plan_name' => $order->plan?->name,
                'billing_cycle' => $order->billing_cycle,
                'original_price' => (float) $order->original_price,
                'discount_amount' => (float) $order->discount_amount,
                'final_price' => (float) $order->final_price,
                'paid_amount' => $order->paid_amount !== null ? (float) $order->paid_amount : null,
                'coupon_code' => $order->coupon_code,
                'payment_method' => $order->payment_method,
                'payment_id' => $order->payment_id,
                'sepay_order_code' => $order->sepay_order_code,
                'sepay_transaction_id' => $order->sepay_transaction_id,
                'sepay_transaction_date' => $order->sepay_transaction_date,
                'status' => $order->status,
                'ordered_at' => $order->ordered_at,
                'processed_at' => $order->processed_at,
                'processed_by' => $order->processedBy ? [
                    'id' => $order->processedBy->id,
                    'name' => $order->processedBy->name,
                    'email' => $order->processedBy->email,
                ] : null,
                'notes' => $order->notes,
                'receipt_path' => $order->receipt_path,
            ]);

        return Inertia::render('companies/show', [
            'company' => [
                'id' => $company->id,
                'avatar' => $company->avatar,
                'name' => $company->name,
                'email' => $company->email,
                'status' => $company->status,
                'lang' => $company->lang,
                'created_at' => $company->created_at,
                'updated_at' => $company->updated_at,
                'email_verified_at' => $company->email_verified_at,
                'plan_expiry_date' => $company->plan_expire_date,
                'plan_is_active' => $company->plan_is_active,
                'is_enable_login' => $company->is_enable_login,
                'storage_limit' => $company->storage_limit,
                'is_trial' => $company->is_trial,
                'trial_day' => $company->trial_day,
                'trial_expire_date' => $company->trial_expire_date,
                'referral_code' => $company->referral_code,
                'used_referral_code' => $company->used_referral_code,
                'commission_amount' => $company->commission_amount,
            ],
            'profile' => $profile ? [
                'id' => $profile->id,
                'company_id' => $profile->company_id,
                'name' => $profile->name,
                'registration_number' => $profile->registration_number,
                'address' => $profile->address,
                'phone' => $profile->phone,
                'email' => $profile->email,
                'website' => $profile->website,
                'logo' => $profile->logo,
                'establishment_date' => $profile->establishment_date,
                'company_size' => $profile->company_size,
                'business_type' => $profile->business_type,
                'status' => $profile->status,
                'description' => $profile->description,
                'advocate_name' => $profile->advocate_name,
                'bar_registration_number' => $profile->bar_registration_number,
                'years_of_experience' => $profile->years_of_experience,
                'law_degree' => $profile->law_degree,
                'university' => $profile->university,
                'specialization' => $profile->specialization,
                'court_jurisdictions' => $profile->court_jurisdictions,
                'languages_spoken' => $profile->languages_spoken,
                'consultation_fees' => $profile->consultation_fees !== null ? (float) $profile->consultation_fees : null,
                'office_hours' => $profile->office_hours,
                'success_rate' => $profile->success_rate,
                'services_offered' => $profile->services_offered,
                'notable_cases' => $profile->notable_cases,
            ] : null,
            'settings' => [
                'titleText' => $settings->get('titleText'),
                'footerText' => $settings->get('footerText'),
                'defaultLanguage' => $settings->get('defaultLanguage'),
                'defaultCurrency' => $settings->get('defaultCurrency'),
                'dateFormat' => $settings->get('dateFormat'),
                'timeFormat' => $settings->get('timeFormat'),
                'defaultTimezone' => $settings->get('defaultTimezone'),
            ],
            'paymentHistory' => $paymentHistory,
            'plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $plan->price,
                'yearly_price' => $plan->yearly_price,
                'max_users' => $plan->max_users,
                'max_cases' => $plan->max_cases,
                'max_clients' => $plan->max_clients,
                'storage_limit' => $plan->storage_limit,
            ] : null,
            'usage' => [
                'users' => [
                    'used' => User::whereIn('created_by', $companyAndUserIds)
                        ->whereDoesntHave('roles', fn ($query) => $query->where('name', 'client'))
                        ->count(),
                    'limit' => $plan?->max_users ?? 0,
                ],
                'cases' => [
                    'used' => CaseModel::whereIn('created_by', $companyAndUserIds)->count(),
                    'limit' => $plan?->max_cases ?? 0,
                ],
                'clients' => [
                    'used' => Client::whereIn('created_by', $companyAndUserIds)->count(),
                    'limit' => $plan?->max_clients ?? 0,
                ],
                'storage' => [
                    'used' => $storageUsedBytes,
                    'limit' => $storageLimitBytes,
                    'used_gb' => round($storageUsedBytes / 1024 / 1024 / 1024, 2),
                    'limit_gb' => (float) ($plan?->storage_limit ?? 0),
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
            'status' => 'required|in:active,inactive',
        ]);

        $company = new User();
        $company->name = $validated['name'];
        $company->email = $validated['email'];

        // Only set password if provided
        if (isset($validated['password'])) {
            $company->password = Hash::make($validated['password']);
        }

        $company->type = 'company';
        $company->status = $validated['status'];
        $company->created_by = auth()->id();


        // Assign default plan
        $defaultPlan = Plan::where('is_default', true)->first();
        if ($defaultPlan) {
            $company->plan_id = $defaultPlan->id;

            // Set plan expiry date based on plan duration
            if ($defaultPlan->duration === 'yearly') {
                $company->plan_expire_date = now()->addYear();
            } else {
                $company->plan_expire_date = now()->addMonth();
            }

            // Set plan is active
            $company->plan_is_active = 1;
        }

        $company->save();

        // Assign role and settings to the user
        defaultRoleAndSetting($company);
        // Trigger email notification
        event(new \App\Events\UserCreated($company, $validated));

        // Check for email errors
        if (session()->has('email_error')) {
            return redirect()->back()->with('warning', __('Company created successfully, but welcome email failed: ') . session('email_error'));
        }

        return redirect()->back()->with('success', __('Company created successfully'));
    }

    public function update(Request $request, User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return redirect()->back()->with('error', __('Invalid company record'));
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $company->id,
        ]);

        $company->name = $validated['name'];
        $company->email = $validated['email'];

        $company->save();

        return redirect()->back()->with('success', __('Company updated successfully'));
    }

    public function destroy(User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return redirect()->back()->with('error', __('Invalid company record'));
        }

        $company->delete();

        return redirect()->back()->with('success', __('Company deleted successfully'));
    }

    public function resetPassword(Request $request, User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return redirect()->back()->with('error', __('Invalid company record'));
        }

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $company->password = Hash::make($validated['password']);
        $company->save();

        return redirect()->back()->with('success', __('Password reset successfully'));
    }

    public function toggleStatus(User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return redirect()->back()->with('error', __('Invalid company record'));
        }

        $company->status = $company->status === 'active' ? 'inactive' : 'active';
        $company->save();

        return redirect()->back()->with('success', __('Company status updated successfully'));
    }

    /**
     * Get available plans for upgrade
     */
    public function getPlans(User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return response()->json(['error' => __('Invalid company record')], 400);
        }

        $plans = Plan::where('is_plan_enable', 'on')->get();

        // Determine the company's current billing cycle from their latest approved plan order
        $latestPlanOrder = $company->planOrders()
            ->where('status', 'approved')
            ->where('plan_id', $company->plan_id)
            ->latest('processed_at')
            ->first();

        $currentBillingCycle = $latestPlanOrder ? $latestPlanOrder->billing_cycle : 'monthly';

        if ($company->is_trial) {
            $currentBillingCycle = 'monthly';
        }

        $formattedPlans = [];

        foreach ($plans as $plan) {
            $features = [];
            if ($plan->enable_chatgpt === 'on') $features[] = __('AI Integration');
            if ($plan->enable_branding === 'on') $features[] = __('Custom Branding');

            $base = [
                'id'              => $plan->id,
                'name'            => $plan->name,
                'description'     => $plan->description,
                'features'        => $features,
                'max_users'       => $plan->max_users,
                'max_cases'       => $plan->max_cases,
                'max_clients'     => $plan->max_clients,
                'storage_limit'   => $plan->storage_limit,
                'enable_branding' => $plan->enable_branding,
                'enable_chatgpt'  => $plan->enable_chatgpt,
                'is_trial'        => $plan->is_trial,
                'trial_day'       => $plan->trial_day,
                'is_default'      => $plan->is_default,
            ];

            // Monthly plan
            $formattedPlans[] = array_merge($base, [
                'price'      => $plan->price,
                'is_current' => $company->plan_id === $plan->id && ($currentBillingCycle == 'monthly'),
                'duration'   => __('Monthly'),
            ]);

            // Yearly plan
            $formattedPlans[] = array_merge($base, [
                'price'      => $plan->yearly_price ?? ($plan->price * 12 * 0.8),
                'is_current' => $company->plan_id === $plan->id && ($currentBillingCycle == 'yearly'),
                'duration'   => __('Yearly'),
            ]);
        }

        return response()->json([
            'plans' => $formattedPlans,
            'company' => [
                'id'              => $company->id,
                'name'            => $company->name,
                'current_plan_id' => $company->plan_id,
            ]
        ]);
    }

    /**
     * Upgrade company plan
     */
    public function upgradePlan(Request $request, User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return back()->with('error', __('Invalid company record'));
        }

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'duration' => 'required|in:yearly,monthly',
        ]);

        $plan = Plan::find($validated['plan_id']);
        if (!$plan) {
            return back()->with('error', __('Plan not found'));
        }


        // Create plan order entry for tracking
        $planOrder = new PlanOrder();
        $planOrder->user_id = $company->id;
        $planOrder->plan_id = $plan->id;
        $planOrder->billing_cycle = $validated['duration'];
        $planOrder->original_price = $validated['duration'] === 'yearly' ? ($plan->yearly_price ?? 0) : $plan->price;
        $planOrder->discount_amount = 0;
        $planOrder->final_price = $planOrder->original_price;
        $planOrder->payment_method = 'admin_upgrade';
        $planOrder->status = 'approved';
        $planOrder->ordered_at = now();
        $planOrder->processed_at = now();
        $planOrder->processed_by = auth()->id();
        $planOrder->notes = 'Plan upgraded by super admin';
        $planOrder->save();

        // Update company plan
        assignPlanToUser($company, $plan, $validated['duration']);

        return back()->with('success', __('Plan upgraded successfully'));
    }

    // Business links method removed
}
