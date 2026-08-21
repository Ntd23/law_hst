<?php

namespace App\Http\Controllers\LandingPage;

use App\Http\Controllers\Controller;
use App\Models\LandingPageCustomPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomPageController extends Controller
{
    public function index(Request $request)
    {
        $query = LandingPageCustomPage::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Sorting
        $allowedSortFields = ['title', 'created_at', 'sort_order'];
        $sortField = $request->get('sort_field', 'sort_order');
        $sortDirection = $request->get('sort_direction', 'asc');

        $sortField = in_array($sortField, $allowedSortFields) ? $sortField : 'sort_order';
        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'asc';

        $query->orderBy($sortField, $sortDirection);

        // Pagination with validation
        $perPage = $request->get('per_page', 10);
        if (!is_numeric($perPage) || $perPage < 1 || $perPage > 100) {
            $perPage = 10;
        }

        $pages = $query->paginate($perPage)->withQueryString();

        return Inertia::render('landing-page/custom-pages/index', [
            'pages' => $pages,
            'filters' => $request->only(['search', 'sort_field', 'sort_direction', 'per_page', 'page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('landing-page/custom-pages/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer'
        ]);

        $slug = \Illuminate\Support\Str::slug($validated['title']);

        if (LandingPageCustomPage::where('slug', $slug)->exists()) {
            return back()->with('error', __('A page with this title already exists. Please use a different title.'));
        }

        LandingPageCustomPage::create($validated);

        return back()->with('success', __('Custom page created successfully!'));
    }

    public function edit(LandingPageCustomPage $customPage)
    {
        return Inertia::render('landing-page/custom-pages/edit', [
            'page' => $customPage
        ]);
    }

    public function update(Request $request, LandingPageCustomPage $customPage)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer'
        ]);

        $slug = \Illuminate\Support\Str::slug($validated['title']);

        if (LandingPageCustomPage::where('slug', $slug)->where('id', '!=', $customPage->id)->exists()) {
            return back()->with('error', __('A page with this title already exists. Please use a different title.'));
        }

        $customPage->update($validated);

        return back()->with('success', __('Custom page updated successfully!'));
    }

    public function destroy(LandingPageCustomPage $customPage)
    {
        $customPage->delete();
        return back()->with('success', __('Custom page deleted successfully!'));
    }

    public function show($slug)
    {
        $slugMap = [
            'about-us' => 'gioi-thieu-ve-cong-ty',
            'gioi-thieu' => 'gioi-thieu-ve-cong-ty',
            'terms-of-service' => 'gioi-thieu-ve-cong-ty',
            'contact-us' => 'lien-he-voi-chung-toi',
            'lien-he' => 'lien-he-voi-chung-toi',
            'faq' => 'cau-hoi-thuong-gap',
            'refund-policy' => 'chinh-sach-hoan-tien',
            'privacy-policy' => 'chinh-sach-bao-mat',
            'luat-su' => 'luat-su-tu-van',
            'lawyers' => 'luat-su-tu-van',
            'cong-ty' => 'luat-su-tu-van',
        ];

        $page = LandingPageCustomPage::where('slug', $slug)->where('is_active', true)->first();

        if (!$page && isset($slugMap[$slug])) {
            $page = LandingPageCustomPage::where('slug', $slugMap[$slug])->where('is_active', true)->first();
        }

        if (!$page) {
            $reverseSlugMap = array_flip($slugMap);
            if (isset($reverseSlugMap[$slug])) {
                $page = LandingPageCustomPage::where('slug', $reverseSlugMap[$slug])->where('is_active', true)->first();
            }
        }

        if (!$page) {
            $page = LandingPageCustomPage::where('is_active', true)->firstOrFail();
        }

        $landingSettings = \App\Models\LandingPageSetting::getSettings();

        $lawyers = \App\Models\User::where(function($q) {
                $q->whereNull('status')->orWhere('status', 1)->orWhere('status', 'active');
            })
            ->where(function($q) {
                $q->where('type', '!=', 'client')->orWhereNull('type');
            })
            ->select('id', 'name', 'email', 'avatar', 'type')
            ->orderBy('name', 'asc')
            ->get();

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

        return Inertia::render('landing-page/custom-page', [
            'page' => $page,
            'customPages' => LandingPageCustomPage::active()->ordered()->get(),
            'settings' => $landingSettings,
            'lawyers' => $lawyers,
            'companies' => $companies,
            'articles' => $articles,
        ]);
    }

    public function showCompanyDetail($id)
    {
        $companyUser = \App\Models\User::where('id', $id)
            ->where('type', 'company')
            ->firstOrFail();

        $profile = \App\Models\CompanyProfile::where('created_by', $companyUser->id)->first();
        $companyLawyers = \App\Models\User::where('created_by', $companyUser->id)
            ->where(function($q) {
                $q->where('type', '!=', 'client')->orWhereNull('type');
            })
            ->select('id', 'name', 'email', 'avatar')
            ->get();
            
        $userIds = $companyLawyers->pluck('id')->toArray();
        $allIds = array_merge([$companyUser->id], $userIds);
        
        $casesCount = \App\Models\CaseModel::whereIn('created_by', $allIds)->count();
        $clientsCount = \App\Models\Client::whereIn('created_by', $allIds)->count();

        $landingSettings = \App\Models\LandingPageSetting::getSettings();

        // Load articles written by this company or its team
        $companyArticlesQuery = \App\Models\KnowledgeArticle::with(['category', 'creator'])
            ->whereIn('created_by', $allIds)
            ->where('status', 'published');

        if ($companyArticlesQuery->count() === 0) {
            // Fallback to latest public published articles
            $companyArticlesQuery = \App\Models\KnowledgeArticle::with(['category', 'creator'])
                ->where('status', 'published')
                ->where('is_public', true);
        }

        $companyArticles = $companyArticlesQuery->latest()->get()->unique('title')->values()->map(function ($article) {
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

        $company = [
            'id' => $companyUser->id,
            'name' => $profile?->name ?: $companyUser->name,
            'email' => $profile?->email ?: $companyUser->email,
            'phone' => $profile?->phone ?: null,
            'address' => $profile?->address ?: null,
            'website' => $profile?->website ?: null,
            'logo' => $profile?->logo ?: $companyUser->avatar,
            'advocate_name' => $profile?->advocate_name ?: $companyUser->name,
            'specialization' => $profile?->specialization ?: null,
            'years_of_experience' => $profile?->years_of_experience ?? null,
            'success_rate' => $profile?->success_rate ?? null,
            'consultation_fees' => $profile?->consultation_fees ?? null,
            'languages_spoken' => $profile?->languages_spoken ?: null,
            'office_hours' => $profile?->office_hours ?: null,
            'registration_number' => $profile?->registration_number ?: null,
            'bar_registration_number' => $profile?->bar_registration_number ?: null,
            'business_type' => $profile?->business_type ?: null,
            'description' => $profile?->description ?: null,
            'law_degree' => $profile?->law_degree ?: null,
            'university' => $profile?->university ?: null,
            'court_jurisdictions' => $profile?->court_jurisdictions ?: null,
            'services_offered' => $profile?->services_offered ?: null,
            'notable_cases' => $profile?->notable_cases ?: null,
            'establishment_date' => $profile?->establishment_date ? (is_string($profile->establishment_date) ? $profile->establishment_date : $profile->establishment_date->format('d/m/Y')) : null,
            'company_size' => $profile?->company_size ?: 'small',
            'plan_name' => $companyUser->plan?->name ?? null,
            'cases_count' => $casesCount,
            'clients_count' => $clientsCount,
            'lawyers_count' => count($companyLawyers),
            'lawyers' => $companyLawyers,
            'created_at' => $companyUser->created_at?->format('d/m/Y') ?? '',
        ];

        return Inertia::render('landing-page/company-detail', [
            'company' => $company,
            'articles' => $companyArticles,
            'customPages' => LandingPageCustomPage::active()->ordered()->get(),
            'settings' => $landingSettings,
        ]);
    }
}
