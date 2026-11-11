<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenant = $this->attributes->get('tenant');

        return [
            'child_id' => [
                'required',
                'integer',
                'min:1',
                Rule::exists('children', 'id')
                    ->where('tenant_id', $tenant->id),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'child_id.required' => 'Child ID is required.',
            'child_id.exists' => 'Child does not belong to this tenant.',
        ];
    }
}