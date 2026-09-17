<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('login ignores intended routes the user cannot access', function () {
    Permission::create(['name' => 'manage-companies', 'guard_name' => 'web']);
    $user = User::factory()->create();

    $response = $this
        ->withSession(['url.intended' => route('companies.index', absolute: false)])
        ->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertNull(session('url.intended'));
});

test('login honors intended routes the user can access', function () {
    $permission = Permission::create(['name' => 'manage-companies', 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->givePermissionTo($permission);

    $response = $this
        ->withSession(['url.intended' => route('companies.index', absolute: false)])
        ->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('companies.index', absolute: false));
    $this->assertNull(session('url.intended'));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
