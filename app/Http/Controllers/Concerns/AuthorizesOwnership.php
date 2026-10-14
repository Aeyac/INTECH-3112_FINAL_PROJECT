<?php

namespace App\Http\Controllers\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

trait AuthorizesOwnership
{
    /**
     * Only members of the record's workspace may manage it.
     */
    protected function authorizeOwnership(User $user, Model $model): void
    {
        abort_unless(
            (int) $model->getAttribute('user_id') === (int) $user->workspaceId(),
            403,
            'You may only manage records in your workspace.'
        );
    }
}
