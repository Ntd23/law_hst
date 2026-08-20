<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Plan;
use App\Models\LandingPageSetting;
use App\Models\LandingPageCustomPage;
use App\Models\Business;
use App\Models\contact;
use App\Models\NewsletterSubscription;
use App\Models\User;

class LandingPageController extends Controller
{
    public function show(Request $request)
    {
        $host = $request->getHost();
        $hostParts = explode('.', $host);

        // Check if landing page is enabled in settings
        if (!isLandingPageEnabled()) {
            return redirect()->route('login');
        }

        $landingSettings = LandingPageSetting::getSettings();

        $plans = Plan::where('is_plan_enable', 'on')->get()->take(3)->map(function ($plan) {
            $features = [];
            if ($plan->enable_custdomain === 'on') $features[] = 'Custom Domain';
            if ($plan->enable_custsubdomain === 'on') $features[] = 'Subdomain';
            if ($plan->pwa_business === 'on') $features[] = 'PWA';
            if ($plan->enable_chatgpt === 'on') $features[] = 'AI Integration';

            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $plan->price,
                'yearly_price' => $plan->yearly_price,
                'duration' => $plan->duration,
                'description' => $plan->description,
                'features' => $features,
                'stats' => [
                    'users' => $plan->max_users,
                    'cases' => $plan->max_cases,
                    'clients' => $plan->max_clients,
                    'storage' => $plan->storage_limit . ' GB',
                ],
                'trial_days' => $plan->trial_day,
                'is_plan_enable' => $plan->is_plan_enable,
                'is_popular' => false // Will be set based on subscriber count
            ];
        });

        // Mark most subscribed plan as popular
        $planSubscriberCounts = Plan::withCount('users')->get()->pluck('users_count', 'id');
        if ($planSubscriberCounts->isNotEmpty()) {
            $mostSubscribedPlanId = $planSubscriberCounts->keys()->sortByDesc(function ($planId) use ($planSubscriberCounts) {
                return $planSubscriberCounts[$planId];
            })->first();

            $plans = $plans->map(function ($plan) use ($mostSubscribedPlanId) {
                if ($plan['id'] == $mostSubscribedPlanId && $plan['price'] != '0') {
                    $plan['is_popular'] = true;
                }
                return $plan;
            });
        }

        // Get FAQs from settings configuration
        $sections = $landingSettings->config_sections['sections'] ?? [];

        $faqSection = collect($sections)->firstWhere('key', 'faq');
        $faqs = collect($faqSection['faqs'] ?? [])
            ->map(function ($faq, $index) {
                return [
                    'id' => $index + 1,
                    'question' => $faq['question'] ?? '',
                    'answer' => $faq['answer'] ?? ''
                ];
            });

        $articles = \App\Models\KnowledgeArticle::with(['category', 'creator'])
            ->where('status', 'published')
            ->where('is_public', true)
            ->latest()
            ->get()
            ->unique('title')
            ->values()
            ->map(function ($article) {
                $categoryName = $article->category?->name ?: 'Pháp luật Doanh nghiệp';
                $tags = is_array($article->tags) ? $article->tags : (json_decode($article->tags, true) ?: []);
                $paragraphs = array_values(array_filter(explode("\n", strip_tags($article->content))));
                $authorName = $article->creator?->name ?: 'Luật sư Chuyên gia';
                $authorRole = $article->creator?->type === 'superadmin' ? 'Hội đồng Cố vấn Pháp lý' : 'Luật sư Thành viên';
                $authorAvatar = $article->creator?->avatar ?: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';

                $images = [
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
                ];
                $img = $images[($article->id - 1) % count($images)];

                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'category' => $categoryName,
                    'category_id' => $article->category_id,
                    'date' => $article->created_at ? $article->created_at->format('d/m/Y') : date('d/m/Y'),
                    'readTime' => '5 phút đọc',
                    'author' => [
                        'name' => $authorName,
                        'role' => $authorRole,
                        'avatar' => $authorAvatar,
                    ],
                    'image' => $img,
                    'summary' => \Illuminate\Support\Str::limit(strip_tags($article->content), 180),
                    'content' => $paragraphs,
                    'tags' => $tags,
                ];
            });

        $companies = \App\Models\User::where('type', 'company')
            ->where(function($q) {
                $q->whereNull('status')->orWhere('status', 1)->orWhere('status', 'active');
            })
            ->with(['plan'])
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($company) {
                $profile = \App\Models\CompanyProfile::where('created_by', $company->id)->first();
                $companyLawyers = \App\Models\User::where('created_by', $company->id)
                    ->where(function($q) {
                        $q->where('type', '!=', 'client')->orWhereNull('type');
                    })
                    ->select('id', 'name', 'email', 'avatar')
                    ->get();
                    
                $userIds = $companyLawyers->pluck('id')->toArray();
                $allIds = array_merge([$company->id], $userIds);
                
                $casesCount = \App\Models\CaseModel::whereIn('created_by', $allIds)->count();
                $clientsCount = \App\Models\Client::whereIn('created_by', $allIds)->count();

                return [
                    'id' => $company->id,
                    'name' => $profile?->name ?: $company->name,
                    'email' => $profile?->email ?: $company->email,
                    'phone' => $profile?->phone ?: ($company->phone ?: null),
                    'address' => $profile?->address ?: null,
                    'website' => $profile?->website ?: null,
                    'logo' => $profile?->logo ?: $company->avatar,
                    'advocate_name' => $profile?->advocate_name ?: $company->name,
                    'specialization' => $profile?->specialization ?: null,
                    'years_of_experience' => $profile?->years_of_experience ?? null,
                    'success_rate' => $profile?->success_rate ?? null,
                    'consultation_fees' => $profile?->consultation_fees ?? null,
                    'languages_spoken' => $profile?->languages_spoken ?: null,
                    'office_hours' => $profile?->office_hours ?: null,
                    'registration_number' => $profile?->registration_number ?: null,
                    'bar_registration_number' => $profile?->bar_registration_number ?: null,
                    'business_type' => $profile?->business_type ?: null,
                    'plan_name' => $company->plan?->name ?? null,
                    'cases_count' => $casesCount,
                    'clients_count' => $clientsCount,
                    'lawyers_count' => count($companyLawyers),
                    'lawyers' => $companyLawyers,
                    'created_at' => $company->created_at?->format('d/m/Y') ?? '',
                ];
            });

        return Inertia::render('landing-page/index', [
            'plans' => $plans,
            'testimonials' => [],
            'faqs' => $faqs,
            'articles' => $articles,
            'companies' => $companies,
            'customPages' => LandingPageCustomPage::active()->ordered()->get() ?? [],
            'settings' => $landingSettings,
            'sectionData' => [
                'faq' => [
                    'title' => $faqSection['title'] ?? 'Frequently Asked Questions',
                    'subtitle' => $faqSection['subtitle'] ?? "Got questions? We've got answers.",
                    'cta_text' => $faqSection['cta_text'] ?? 'Still have questions?',
                    'button_text' => $faqSection['button_text'] ?? 'Contact Support',
                    'default_faqs' => $faqs->toArray()
                ]
            ]
        ]);
    }

    public function submitContact(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'practice_area' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
            'preferred_lawyer' => 'nullable|string|max:255',
        ]);

        $fullMessage = $request->message;
        $extraInfo = [];
        if ($request->filled('phone')) $extraInfo[] = "Số điện thoại: " . $request->phone;
        if ($request->filled('address')) $extraInfo[] = "Địa chỉ: " . $request->address;
        if ($request->filled('practice_area')) $extraInfo[] = "Lĩnh vực quan tâm: " . $request->practice_area;
        
        $userId = $request->filled('user_id') ? $request->user_id : null;
        if ($userId) {
            $selectedLawyer = User::find($userId);
            if ($selectedLawyer) {
                $extraInfo[] = "Luật sư mong muốn: " . $selectedLawyer->name;
            }
        } elseif ($request->filled('preferred_lawyer')) {
            $extraInfo[] = "Luật sư mong muốn: " . $request->preferred_lawyer;
        }

        if (!empty($extraInfo)) {
            $fullMessage = "[Thông Tin Tư Vấn]\n" . implode("\n", $extraInfo) . "\n\n[Mô Tả Nội Dung Câu Hỏi]\n" . $request->message;
        }

        $contact = new contact();
        $contact->name = $request->name;
        $contact->email = $request->email;
        $contact->phone = $request->phone ?? null;
        $contact->subject = $request->subject;
        $contact->message = $fullMessage;
        $contact->status = 'pending';
        $contact->user_id = $userId;
        $contact->save();

        return back()->with('success', __('Thank you for your message. We will get back to you soon!'));
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255'
        ]);

        try {
            $newsletter = NewsletterSubscription::firstOrCreate([
                'email' => $request->email,
            ]);

            if ($newsletter->wasRecentlyCreated) {
                return back()->with('success', __('Thank you for subscribing to our newsletter!'));
            } else {
                return back()->with('error', __('This email is already subscribed to our newsletter.'));
            }
        } catch (\Exception $e) {
            return back()->with('error', __('Something went wrong. Please try again later.'));
        }
    }

    public function settings()
    {
        $landingSettings = LandingPageSetting::getSettings();

        return Inertia::render('landing-page/settings', [
            'settings' => $landingSettings
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:255',
            'contact_address' => 'required|string|max:255',
            'config_sections' => 'required|array'
        ]);
        $landingSettings = LandingPageSetting::getSettings();
        $landingSettings->update($request->all());

        return back()->with('success', __('Landing page settings updated successfully!'));
    }
}
