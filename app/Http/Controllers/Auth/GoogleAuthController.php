<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $redirect = $request->query('redirect');

        if (
            is_string($redirect)
            && str_starts_with($redirect, '/')
            && ! str_starts_with($redirect, '//')
        ) {
            $request->session()->put('url.intended', $redirect);
        }

        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $exception) {
            report($exception);

            return redirect('/login?error=google_oauth_failed');
        }

        $googleId = $googleUser->getId();
        $email = $googleUser->getEmail();

        if (! is_string($googleId) || ! is_string($email)) {
            return redirect('/login?error=google_email_unavailable');
        }

        $email = Str::lower($email);

        $user = User::query()
            ->where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if (! $user) {
            $user = new User;
        }

        $user->forceFill([
            'name' => $googleUser->getName() ?: Str::before($email, '@'),
            'email' => $email,
            'google_id' => $googleId,
            'avatar_url' => $googleUser->getAvatar(),
        ])->save();

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended('/app/projects');
    }

    public function currentUser(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => $this->userPayload($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'data' => null,
            'message' => 'Logout successful.',
        ]);
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     avatar_url: string|null
     * }
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
        ];
    }
}
