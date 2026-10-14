<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesOwnership;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    use AuthorizesOwnership;

    //   Display a listing of the active and archived categories.
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Categories/Index', [
            'categories' => Category::query()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(),
            'archivedCategories' => Category::onlyTrashed()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(),
            'can' => [
                'manage' => $user->can('manage-categories'),
            ],
        ]);
    }

    // Store a newly created category.
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->where(
                    fn($query) => $query->where('user_id', $user->workspaceId())
                ),
            ],
        ]);

        Category::create([
            'user_id' => $user->workspaceId(),
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    // Update the given category.
    public function update(Request $request, Category $category): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeOwnership($user, $category);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')
                    ->where(fn($query) => $query->where('user_id', $category->user_id))
                    ->ignore($category->id),
            ],
        ]);

        $category->update(['name' => $validated['name']]);

        return back()->with('success', 'Category updated successfully.');
    }

    // Soft delete (archive) the given category.
    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $this->authorizeOwnership($request->user(), $category);

        $category->delete();

        return back()->with('success', 'Category archived successfully.');
    }

    // Restore a previously archived category.
    public function restore(Request $request, Category $category): RedirectResponse
    {
        $this->authorizeOwnership($request->user(), $category);

        $category->restore();

        return back()->with('success', 'Category restored successfully.');
    }
}
