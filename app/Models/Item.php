<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;


class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'stock',
        'safety_stock',
        'selling_price',
    ];

    protected $appends = [
        'category_name',
    ];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'safety_stock' => 'integer',
            'selling_price' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function stockLedger(): HasMany
    {
        return $this->hasMany(StockLedger::class);
    }

    public function getCategoryNameAttribute(): ?string
    {
        return $this->category?->name;
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->workspaceId());
    }

}
