
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_ins', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedBigInteger('room_id');
            $table->unsignedBigInteger('child_id');

            $table->timestamp('checked_in_at');
            $table->timestamp('checked_out_at')->nullable();

            // Automatically identifies active check-ins.
            $table->unsignedBigInteger('active_child_id')
                ->nullable()
                ->storedAs(
                    'CASE WHEN checked_out_at IS NULL
                     THEN child_id ELSE NULL END'
                );

            $table->timestamps();

            // Ensure room belongs to the same tenant.
            $table->foreign(['room_id', 'tenant_id'])
                ->references(['id', 'tenant_id'])
                ->on('rooms')
                ->cascadeOnDelete();

            // Ensure child belongs to the same tenant.
            $table->foreign(['child_id', 'tenant_id'])
                ->references(['id', 'tenant_id'])
                ->on('children')
                ->cascadeOnDelete();

            // One active check-in per child.
            $table->unique('active_child_id');

            $table->index([
                'tenant_id',
                'room_id',
                'checked_out_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};
