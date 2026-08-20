<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeArticle;
use App\Models\ResearchCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KnowledgeArticleController extends Controller
{
    public function index(Request $request)
    {
        if (!Auth::user()->can('manage-knowledge-articles') && Auth::user()->type !== 'superadmin') {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $isSuperAdmin = Auth::user()->type === 'superadmin';

        $query = KnowledgeArticle::with(['category.practiceArea', 'creator']);

        if (!$isSuperAdmin) {
            $query->where(function ($q) {
                if (Auth::user()->can('manage-any-knowledge-articles')) {
                    $q->whereIn('created_by', getCompanyAndUsersId());
                } elseif (Auth::user()->can('manage-own-knowledge-articles')) {
                    $q->where('created_by', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            });
        }

        $stats = (clone $query)
            ->select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $stats['total'] = (clone $query)->count();

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category_id') && $request->category_id !== '_empty_') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status') && $request->status !== '_empty_') {
            $allowedStatuses = ['draft', 'published', 'archived'];
            if (in_array($request->status, $allowedStatuses)) {
                $query->where('status', $request->status);
            }
        }

        $sortDirection = $request->input('sort_direction', 'desc');
        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'desc';
        $query->orderBy('created_at', $sortDirection);

        $perPage = $request->input('per_page', 9);
        if (!is_numeric($perPage) || $perPage < 1 || $perPage > 90) {
            $perPage = 9;
        }

        $articles = $query->paginate($perPage)->withQueryString();

        $categoryQuery = ResearchCategory::with('practiceArea');
        if (!$isSuperAdmin) {
            $categoryQuery->where(function ($q) {
                if (Auth::user()->can('manage-any-research-categories')) {
                    $q->whereIn('created_by', getCompanyAndUsersId());
                } elseif (Auth::user()->can('manage-own-research-categories')) {
                    $q->where('created_by', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            });
        }
        $allCategories = (clone $categoryQuery)->get(['id', 'name', 'practice_area_id']);
        $categories = (clone $categoryQuery)->active()->get(['id', 'name', 'practice_area_id']);

        return Inertia::render('legal-research/knowledge/articles', [
            'articles' => $articles,
            'stats' => $stats,
            'categories' => $categories,
            'allCategories' => $allCategories,
            'filters' => $request->only(['search', 'category_id', 'status', 'sort_field', 'sort_direction', 'per_page', 'page']),
        ]);
    }

    public function store(Request $request)
    {
        if (!Auth::user()->can('create-knowledge-articles') && Auth::user()->type !== 'superadmin') {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $isSuperAdmin = Auth::user()->type === 'superadmin';

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($isSuperAdmin) {
                    $query = KnowledgeArticle::whereRaw('LOWER(title) = ?', [strtolower($value)]);
                    if (!$isSuperAdmin) {
                        $query->whereIn('created_by', getCompanyAndUsersId());
                    } else {
                        $query->where('created_by', Auth::id());
                    }
                    if ($query->exists()) {
                        $fail(__('A knowledge article with this title already exists.'));
                    }
                }
            ],
            'content' => 'required|string',
            'category_id' => 'nullable|exists:research_categories,id',
            'tags' => 'nullable|array',
            'is_public' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published,archived',
        ]);

        if (!empty($validated['category_id'])) {
            $catQuery = ResearchCategory::active()->where('id', $validated['category_id']);
            if (!$isSuperAdmin) {
                $catQuery->whereIn('created_by', getCompanyAndUsersId());
            }
            $category = $catQuery->first();
            if (!$category) {
                return redirect()->back()->with('error', __('Invalid category selection.'));
            }
        }

        $validated['created_by'] = Auth::id();
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['is_public'] = $validated['is_public'] ?? false;

        KnowledgeArticle::create($validated);

        return redirect()->back()->with('success', __('Knowledge article created successfully.'));
    }

    public function update(Request $request, $articleId)
    {
        if (!Auth::user()->can('edit-knowledge-articles') && Auth::user()->type !== 'superadmin') {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $isSuperAdmin = Auth::user()->type === 'superadmin';

        $articleQuery = KnowledgeArticle::where('id', $articleId);
        if (!$isSuperAdmin) {
            $articleQuery->where(function ($q) {
                if (Auth::user()->can('manage-any-knowledge-articles')) {
                    $q->whereIn('created_by', getCompanyAndUsersId());
                } elseif (Auth::user()->can('manage-own-knowledge-articles')) {
                    $q->where('created_by', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            });
        }
        $article = $articleQuery->first();

        if (!$article) {
            return redirect()->back()->with('error', __('Knowledge article not found.'));
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:research_categories,id',
            'tags' => 'nullable|array',
            'is_public' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published,archived',
        ]);

        if (!empty($validated['category_id'])) {
            $catQuery = ResearchCategory::active()->where('id', $validated['category_id']);
            if (!$isSuperAdmin) {
                $catQuery->whereIn('created_by', getCompanyAndUsersId());
            }
            $category = $catQuery->first();
            if (!$category) {
                return redirect()->back()->with('error', __('Invalid category selection.'));
            }
        }

        $existsQuery = KnowledgeArticle::where('title', $validated['title'])->where('id', '!=', $articleId);
        if (!$isSuperAdmin) {
            $existsQuery->whereIn('created_by', getCompanyAndUsersId());
        }
        if ($existsQuery->exists()) {
            return redirect()->back()->with('error', __('Knowledge article already exists.'));
        }

        $article->update($validated);

        return redirect()->back()->with('success', __('Knowledge article updated successfully.'));
    }

    public function destroy($articleId)
    {
        if (!Auth::user()->can('delete-knowledge-articles') && Auth::user()->type !== 'superadmin') {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $isSuperAdmin = Auth::user()->type === 'superadmin';

        $articleQuery = KnowledgeArticle::where('id', $articleId);
        if (!$isSuperAdmin) {
            $articleQuery->where(function ($q) {
                if (Auth::user()->can('manage-any-knowledge-articles')) {
                    $q->whereIn('created_by', getCompanyAndUsersId());
                } elseif (Auth::user()->can('manage-own-knowledge-articles')) {
                    $q->where('created_by', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            });
        }
        $article = $articleQuery->first();

        if (!$article) {
            return redirect()->back()->with('error', __('Knowledge article not found.'));
        }

        $article->delete();

        return redirect()->back()->with('success', __('Knowledge article deleted successfully.'));
    }

    public function publish($articleId)
    {
        if (!Auth::user()->can('publish-knowledge-articles') && Auth::user()->type !== 'superadmin') {
            return redirect()->back()->with('error', __('Permission Denied.'));
        }

        $isSuperAdmin = Auth::user()->type === 'superadmin';

        $articleQuery = KnowledgeArticle::where('id', $articleId);
        if (!$isSuperAdmin) {
            $articleQuery->where(function ($q) {
                if (Auth::user()->can('manage-any-knowledge-articles')) {
                    $q->whereIn('created_by', getCompanyAndUsersId());
                } elseif (Auth::user()->can('manage-own-knowledge-articles')) {
                    $q->where('created_by', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            });
        }
        $article = $articleQuery->first();

        if (!$article) {
            return redirect()->back()->with('error', __('Knowledge article not found.'));
        }

        $article->status = $article->status === 'published' ? 'draft' : 'published';
        $article->save();

        return redirect()->back()->with('success', __('Knowledge article status updated successfully.'));
    }
}
