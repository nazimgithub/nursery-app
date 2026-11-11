<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\Room;
use App\Models\Child;
use App\Models\CheckIn;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckInTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenantA;
    private Tenant $tenantB;

    private Room $roomA;
    private Room $roomB;

    private Child $childA;
    private Child $childB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantA = Tenant::create([
            'name' => 'Nursery A',
        ]);

        $this->tenantB = Tenant::create([
            'name' => 'Nursery B',
        ]);

        $this->roomA = Room::create([
            'tenant_id' => $this->tenantA->id,
            'name' => 'Sunflowers',
        ]);

        $this->roomB = Room::create([
            'tenant_id' => $this->tenantB->id,
            'name' => 'Little Explorers',
        ]);

        $this->childA = Child::create([
            'tenant_id' => $this->tenantA->id,
            'name' => 'Ali',
        ]);

        $this->childB = Child::create([
            'tenant_id' => $this->tenantB->id,
            'name' => 'Ahmed',
        ]);
    }

    /**
     * Check a child into a room successfully.
     */
    public function test_child_can_check_into_room(): void
    {
        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->postJson(
            "/api/rooms/{$this->roomA->id}/check-ins",
            [
                'child_id' => $this->childA->id,
            ]
        );

        $response->assertCreated()
            ->assertJsonPath('data.child_id', $this->childA->id);

        $this->assertDatabaseHas('check_ins', [
            'tenant_id' => $this->tenantA->id,
            'room_id' => $this->roomA->id,
            'child_id' => $this->childA->id,
            'checked_out_at' => null,
        ]);
    }

    /**
     * Check a child out successfully.
     */
    public function test_child_can_check_out(): void
    {
        $checkIn = $this->createActiveCheckIn();

        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->postJson(
            "/api/check-ins/{$checkIn->id}/check-out"
        );

        $response->assertOk();

        $this->assertNotNull(
    CheckIn::findOrFail($checkIn->id)->checked_out_at
);
    }

    /**
     * List current room occupants.
     */
    public function test_room_occupants_are_returned(): void
    {
        $this->createActiveCheckIn();

        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->getJson(
            "/api/rooms/{$this->roomA->id}/occupants"
        );

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.child.name', 'Ali');
    }

    /**
     * Prevent duplicate active check-ins.
     */
    public function test_child_cannot_check_into_two_rooms(): void
    {
        $this->createActiveCheckIn();

        $secondRoom = Room::create([
            'tenant_id' => $this->tenantA->id,
            'name' => 'Butterflies',
        ]);

        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->postJson(
            "/api/rooms/{$secondRoom->id}/check-ins",
            [
                'child_id' => $this->childA->id,
            ]
        );

        $response->assertStatus(409);
    }

    /**
     * Prevent checking out an already checked-out child.
     */
    public function test_child_cannot_be_checked_out_twice(): void
    {
        $checkIn = $this->createActiveCheckIn();

        $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->postJson(
            "/api/check-ins/{$checkIn->id}/check-out"
        )->assertOk();

        $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->postJson(
            "/api/check-ins/{$checkIn->id}/check-out"
        )->assertStatus(409);
    }

    /**
     * Tenant A cannot access Tenant B's room.
     */
    public function test_tenant_cannot_view_another_tenants_room(): void
    {
        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->getJson(
            "/api/rooms/{$this->roomB->id}/occupants"
        );

        $response->assertNotFound();
    }

    /**
     * Tenant A cannot check out Tenant B's check-in.
     */
    public function test_tenant_cannot_checkout_another_tenants_checkin(): void
    {
        $checkIn = CheckIn::create([
            'tenant_id' => $this->tenantB->id,
            'room_id' => $this->roomB->id,
            'child_id' => $this->childB->id,
            'checked_in_at' => now(),
        ]);

        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->postJson(
            "/api/check-ins/{$checkIn->id}/check-out"
        );

        $response->assertNotFound();

        $this->assertDatabaseHas('check_ins', [
            'id' => $checkIn->id,
            'checked_out_at' => null,
        ]);
    }

    /**
     * Tenant A cannot check Tenant B's child into its room.
     */
    public function test_tenant_cannot_check_in_another_tenants_child(): void
    {
        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->postJson(
            "/api/rooms/{$this->roomA->id}/check-ins",
            [
                'child_id' => $this->childB->id,
            ]
        );

        $response->assertUnprocessable();
    }

    /**
     * Reject requests without tenant header.
     */
    public function test_tenant_header_is_required(): void
    {
        $response = $this->postJson(
            "/api/rooms/{$this->roomA->id}/check-ins",
            [
                'child_id' => $this->childA->id,
            ]
        );

        $response->assertStatus(400);
    }

    /**
     * Reject duplicate or missing child IDs.
     */
    public function test_child_id_is_required(): void
    {
        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->postJson(
            "/api/rooms/{$this->roomA->id}/check-ins",
            []
        );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('child_id');
    }

    /**
     * Empty rooms should return an empty collection.
     */
    public function test_empty_room_returns_empty_occupants(): void
    {
        $response = $this->withHeader(
            'X-Tenant-ID',
            $this->tenantA->id
        )->getJson(
            "/api/rooms/{$this->roomA->id}/occupants"
        );

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    private function createActiveCheckIn(): CheckIn
    {
        return CheckIn::create([
            'tenant_id' => $this->tenantA->id,
            'room_id' => $this->roomA->id,
            'child_id' => $this->childA->id,
            'checked_in_at' => now(),
        ]);
    }
}
