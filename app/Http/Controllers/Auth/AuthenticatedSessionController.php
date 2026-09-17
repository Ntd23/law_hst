<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\LoginHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'settings' => settings()
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $this->logLoginHistory($request);

        // Check if email verification is enabled and user is not verified
        $emailVerificationEnabled = getSetting('emailVerification', false);
        if ($emailVerificationEnabled && !$request->user()->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        return $this->redirectAfterLogin($request);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function logLoginHistory(Request $request): void
    {
        $ip = $request->ip();
        $locationData = $this->getLocationData($ip);
        $userAgent = $request->userAgent();
        $browserData = parseBrowserData($userAgent);
        $details = array_merge($locationData, $browserData, [
            'status' => 'success',
            'referrer_host' => $request->headers->get('referer') ? parse_url($request->headers->get('referer'), PHP_URL_HOST) : null,
            'referrer_path' => $request->headers->get('referer') ? parse_url($request->headers->get('referer'), PHP_URL_PATH) : null,
        ]);

        $loginHistory             = new LoginHistory();
        $loginHistory->user_id    = Auth::id();
        $loginHistory->ip         = $ip;
        $loginHistory->date       = now()->toDateString();
        $loginHistory->details    = $details;
        $loginHistory->type       = Auth::user()->type;
        $loginHistory->created_by = Auth::user()->creatorId() ?: Auth::id();
        $loginHistory->save();
    }

    private function redirectAfterLogin(Request $request): RedirectResponse
    {
        $fallback = route('dashboard', absolute: false);
        $intendedUrl = $request->session()->pull('url.intended');

        if ($this->canAccessIntendedUrl($request, $intendedUrl)) {
            return redirect()->to($intendedUrl);
        }

        return redirect()->to($fallback);
    }

    private function canAccessIntendedUrl(Request $request, ?string $intendedUrl): bool
    {
        if (!$intendedUrl || !$request->user()) {
            return false;
        }

        $intendedHost = parse_url($intendedUrl, PHP_URL_HOST);
        if ($intendedHost && $intendedHost !== $request->getHost()) {
            return false;
        }

        try {
            $route = app('router')->getRoutes()->match(Request::create($intendedUrl, 'GET'));
        } catch (Throwable) {
            return false;
        }

        if (in_array($route->getName(), ['translations', 'refresh-language', 'language.load', 'sepay.order-status'], true)) {
            return false;
        }

        $user = $request->user();
        if ($user->isSuperAdmin()) {
            return true;
        }

        foreach ($route->gatherMiddleware() as $middleware) {
            if (!is_string($middleware)) {
                continue;
            }

            if (str_contains($middleware, 'SuperAdminMiddleware')) {
                return false;
            }

            if (str_starts_with($middleware, 'permission:') && !$this->userHasAnyPermission($user, $this->middlewareArguments($middleware))) {
                return false;
            }

            if (str_starts_with($middleware, 'role:') && !$this->userHasAnyRole($user, $this->middlewareArguments($middleware))) {
                return false;
            }

            if (str_starts_with($middleware, 'role_or_permission:') && !$this->userHasAnyRoleOrPermission($user, $this->middlewareArguments($middleware))) {
                return false;
            }
        }

        return true;
    }

    private function middlewareArguments(string $middleware): array
    {
        $arguments = explode(':', $middleware, 2)[1] ?? '';
        $arguments = explode(',', $arguments, 2)[0];

        return array_values(array_filter(array_map('trim', explode('|', $arguments))));
    }

    private function userHasAnyPermission($user, array $permissions): bool
    {
        if (empty($permissions)) {
            return false;
        }

        try {
            return $user->hasAnyPermission($permissions);
        } catch (Throwable) {
            return false;
        }
    }

    private function userHasAnyRole($user, array $roles): bool
    {
        if (empty($roles)) {
            return false;
        }

        try {
            return $user->hasAnyRole($roles);
        } catch (Throwable) {
            return false;
        }
    }

    private function userHasAnyRoleOrPermission($user, array $rolesOrPermissions): bool
    {
        return $this->userHasAnyRole($user, $rolesOrPermissions)
            || $this->userHasAnyPermission($user, $rolesOrPermissions);
    }

    private function getLocationData(string $ip): array
    {
        try {
            $response = Http::timeout(5)->get("http://ip-api.com/json/{$ip}");
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'country' => $data['country'] ?? null,
                    'countryCode' => $data['countryCode'] ?? null,
                    'region' => $data['region'] ?? null,
                    'regionName' => $data['regionName'] ?? null,
                    'city' => $data['city'] ?? null,
                    'zip' => $data['zip'] ?? null,
                    'lat' => $data['lat'] ?? null,
                    'lon' => $data['lon'] ?? null,
                    'timezone' => $data['timezone'] ?? null,
                    'isp' => $data['isp'] ?? null,
                    'org' => $data['org'] ?? null,
                    'as' => $data['as'] ?? null,
                    'query' => $data['query'] ?? $ip,
                ];
            }
        } catch (\Exception $e) {
            // Ignore API errors
        }

        return ['query' => $ip];
    }
}
