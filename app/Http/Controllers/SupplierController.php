<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesOwnership;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    use AuthorizesOwnership;

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => Supplier::query()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(),
            'archivedSuppliers' => Supplier::onlyTrashed()
                ->visibleTo($user)
                ->orderBy('name')
                ->get(),
            'can' => [
                'manage' => $user->can('manage-suppliers'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate($this->rules($user->workspaceId()), $this->messages());

        Supplier::create([
            'user_id' => $user->workspaceId(),
            'name' => $validated['name'],
            'contact_number' => $validated['contact_number'],
            'email' => $validated['email'],
            'status' => true,
        ]);

        return back()->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeOwnership($user, $supplier);

        $validated = $request->validate(
            $this->rules($supplier->user_id, $supplier->id),
            $this->messages()
        );

        $supplier->update([
            'name' => $validated['name'],
            'contact_number' => $validated['contact_number'],
            'email' => $validated['email'],
        ]);

        return back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorizeOwnership($request->user(), $supplier);

        $supplier->delete();

        return back()->with('success', 'Supplier archived successfully.');
    }

    public function restore(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorizeOwnership($request->user(), $supplier);

        $supplier->restore();

        return back()->with('success', 'Supplier restored successfully.');
    }

    private function rules(int $ownerId, ?int $ignoreId = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:15', 'regex:/^[0-9]+$/'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('suppliers', 'email')
                    ->where(fn($query) => $query->where('user_id', $ownerId))
                    ->ignore($ignoreId),
            ],
        ];
    }

    private function messages(): array
    {
        return [
            'contact_number.max' => 'Maximum of 15 digits.',
            'contact_number.regex' => 'Contact number must contain digits only.',
            'email.unique' => 'Supplier already exists.',
        ];
    }
}
