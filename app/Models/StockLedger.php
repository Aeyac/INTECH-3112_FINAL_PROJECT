<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;


class StockLedger extends Model
{
    use HasFactory;

    protected $table = 'stock_ledger';

    protected $fillable = [
        'item_id',
        'type',
        'reference_id',
        'quantity_change',
        'balance_after',
    ];

    protected $appends = [
        'item_name',
    ];

    protected function casts(): array
    {
        return [
            'quantity_change' => 'integer',
            'balance_after' => 'integer',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function getItemNameAttribute(): ?string
    {
        return $this->item?->name;
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->whereHas('item', fn(Builder $item) => $item->where('user_id', $user->workspaceId()));
    }

}
