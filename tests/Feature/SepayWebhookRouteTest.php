<?php

test('sepay api webhook is not blocked by csrf middleware', function () {
    $this->postJson('/api/sepay/webhook', [])->assertStatus(401);
});
