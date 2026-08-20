<?php

declare(strict_types=1);

namespace App\Http\Requests;

class UpdateInstituicaoRequest extends StoreInstituicaoRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return parent::authorize();
    }
}
