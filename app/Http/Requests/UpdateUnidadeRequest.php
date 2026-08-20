<?php

declare(strict_types=1);

namespace App\Http\Requests;

class UpdateUnidadeRequest extends StoreUnidadeRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return parent::authorize();
    }
}
