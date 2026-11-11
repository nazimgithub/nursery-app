<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        // Read tenant ID from request header.
        $tenantId = $request->header('X-Tenant-ID');

        // Reject missing or invalid tenant IDs.
        if (!$tenantId || !ctype_digit((string) $tenantId) || (int) $tenantId < 1) {
            return response()->json([
                'message' => 'A valid X-Tenant-ID header is required.',
            ], 400);
        }

        // Find the requested tenant.
        $tenant = Tenant::find($tenantId);

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found.',
            ], 404);
        }

        // Attach tenant to the current request.
        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }
}