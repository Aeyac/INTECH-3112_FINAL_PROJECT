<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesOwnership;
use App\Models\Category;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    use AuthorizesOwnership;

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Items/Index', [
            'items' => Item::query()
                ->with('category')
                ->visibleTo($user)
                ->orderBy('name')
                ->get(),
            'archivedItems' => Item::onlyTrashed()
                ->with('category')
                ->visibleTo($user)
                ->orderBy('name')
                ->get(),
            'categories' => Category::query()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(['id', 'name']),
            'can' => [
                'manage' => $user->can('manage-items'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate($this->rules($user->workspaceId()));

        Item::create([
            'user_id' => $user->workspaceId(),
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'stock' => 0, // stock only ever increases through a recorded purchase
            'safety_stock' => $validated['safety_stock'],
            'selling_price' => $validated['selling_price'],
        ]);

        return back()->with('success', 'Item created successfully.');
    }

    public function update(Request $request, Item $item): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeOwnership($user, $item);

        $validated = $request->validate($this->rules($item->user_id, $item->id));

        $item->update([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'safety_stock' => $validated['safety_stock'],
            'selling_price' => $validated['selling_price'],
        ]);

        return back()->with('success', 'Item updated successfully.');
    }

    public function destroy(Request $request, Item $item): RedirectResponse
    {
        $this->authorizeOwnership($request->user(), $item);

        $item->delete();

        return back()->with('success', 'Item deleted successfully.');
    }

    public function restore(Request $request, Item $item): RedirectResponse
    {
        $this->authorizeOwnership($request->user(), $item);

        $item->restore();

        return back()->with('success', 'Item restored successfully.');
    }

    private function rules(int $ownerId, ?int $ignoreId = null): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('items', 'name')
                    ->where(fn($query) => $query->where('user_id', $ownerId))
                    ->ignore($ignoreId),
            ],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where(
                    fn($query) => $query->where('user_id', $ownerId)
                ),
            ],
            'safety_stock' => ['required', 'integer', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
