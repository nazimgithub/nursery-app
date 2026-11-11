Nursery Management API
A multi-tenant REST API built with Laravel 12 for managing nursery rooms, child check-ins, check-outs, and current room occupants.

1. Overview
   This application allows nursery staff to:
   • Check children into rooms.
   • Check children out of rooms.
   • View children currently occupying a room.
   • Keep nursery group data isolated between tenants.
   The application uses a shared database architecture. Each tenant's data is associated with a tenant_id.

2. Technology Stack
   • PHP 8.2+
   • Laravel 12
   • MySQL / MariaDB
   • SQLite for automated tests
   • Eloquent ORM
   • PHPUnit
   • REST API

3. Installation
   Requirements
   • PHP 8.2 or higher
   • Composer
   • MySQL or MariaDB
   • Required PHP extensions, including PDO MySQL and PDO SQLite
   Clone the repository
   git clone <YOUR_REPOSITORY_URL>
   cd nursery-api
   Install dependencies
   composer install
   Configure environment
   cp .env.example .env
   php artisan key:generate
   Configure your database in .env:
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nursery_app
   DB_USERNAME=root
   DB_PASSWORD=
   Create the database nursery_app before running migrations.
   Run migrations
   php artisan migrate
   Start the application
   php artisan serve
   Application URL:
   http://127.0.0.1:8000

4. Database Structure
   The application uses four main tables.
   tenants
   Stores nursery groups.
   • id
   • name
   • timestamps
   rooms
   Stores rooms belonging to tenants.
   • id
   • tenant_id
   • name
   • timestamps
   children
   Stores children belonging to tenants.
   • id
   • tenant_id
   • name
   • timestamps
   check_ins
   Stores check-in and checkout history.
   • id
   • tenant_id
   • room_id
   • child_id
   • checked_in_at
   • checked_out_at
   • active_child_id (generated column)
   • timestamps
   A NULL checked_out_at indicates an active check-in.
   A generated column and unique index enforce one active check-in per child at the database level.
   Composite foreign keys ensure that the room and child referenced by a check-in belong to the same tenant.

5. API Documentation
   All endpoints require the following header:
   X-Tenant-ID: 1
   Accept: application/json
   Authentication is assumed to be handled externally, as specified in the assignment.
   5.1 Check a child into a room
   POST
   /api/rooms/{room}/check-ins
   Request body:
   {
   "child_id": 1
   }
   Success response: 201 Created
   {
   "data": {
   "id": 1,
   "room_id": 1,
   "child_id": 1,
   "child": {
   "id": 1,
   "name": "Ali"
   },
   "checked_in_at": "2026-11-10T04:46:36.000000Z",
   "checked_out_at": null
   }
   }
   5.2 Check a child out
   POST
   /api/check-ins/{id}/check-out
   Success response: 200 OK
   The checkout timestamp is updated, and the check-in history is retained.
   5.3 List current room occupants
   GET
   /api/rooms/{room}/occupants
   Success response: 200 OK
   Returns children with active check-ins in the requested room.
   An empty room returns:
   {
   "data": []
   }

6. Business Decisions
   A child cannot be in two rooms simultaneously
   The application rejects a second active check-in for a child with HTTP 409 Conflict.
   This decision preserves data consistency and prevents children from appearing in multiple rooms simultaneously.
   A staff member must check out the child from their current room before checking them into another room.
   Checkout behaviour
   A checkout updates checked_out_at instead of deleting the record.
   This preserves historical check-in information.
   Attempting to check out an already checked-out child returns HTTP 409 Conflict.

7. Multi-Tenant Security
   Tenant identification is handled by the ResolveTenant middleware using the X-Tenant-ID request header.
   Tenant ownership is enforced through:
   • Tenant-scoped Eloquent queries.
   • Tenant-scoped room and child lookups.
   • Tenant-scoped check-in lookups.
   • Composite database foreign keys.
   • Automated tests for cross-tenant access.
   A tenant cannot view another tenant's occupants, check out another tenant's check-in, or check in another tenant's child.
   Missing or invalid tenant headers are rejected.
   The tenant header is assumed to be supplied by the authenticated application or trusted API gateway. It must not be treated as an authentication mechanism by itself.

8. Running Tests
   The PHPUnit environment uses an in-memory SQLite database, independently of the local development database.
   Run all tests:
   php artisan test
   Run the check-in feature tests:
   php artisan test --filter=CheckInTest
   The feature tests cover:
   • Successful check-in.
   • Successful checkout.
   • Listing current occupants.
   • Duplicate active check-in prevention.
   • Duplicate checkout prevention.
   • Cross-tenant room access prevention.
   • Cross-tenant checkout prevention.
   • Cross-tenant child check-in prevention.
   • Missing tenant header.
   • Missing child ID.
   • Empty room occupants.

9. What I Would Improve With More Time
   • Add authentication and authorization integration.
   • Add API rate limiting.
   • Introduce more comprehensive structured logging.
   • Add additional tests for invalid tenant IDs and database-level constraints.
   • Add OpenAPI/Swagger documentation.
   • Add CI/CD automation.
   • Add Docker-based local development and deployment configuration.

10. What I Intentionally Left Out
    • Frontend application.
    • User registration and login.
    • Authentication implementation, because authentication was assumed to be handled by the assignment.
    • AWS deployment and infrastructure code.
    • Unnecessary third-party dependencies.

11. AWS ECS/Fargate Deployment Approach
    I would deploy the Laravel API as a Docker container running on Amazon ECS with AWS Fargate. The container image would include PHP, the required PHP extensions, Composer production dependencies, and the Laravel application code. Nginx and PHP-FPM could run in the same container or as separate containers, depending on the deployment architecture. I would build the image through a CI/CD pipeline and store versioned images in Amazon ECR.
    The ECS service would run tasks across multiple Availability Zones behind an Application Load Balancer. The load balancer would terminate HTTPS and distribute traffic to healthy tasks. Sensitive configuration, including database credentials and application secrets, would be stored in AWS Secrets Manager or Systems Manager Parameter Store and injected into ECS tasks securely rather than committed to source control.
    For production, I would use Amazon RDS for MySQL or MariaDB instead of SQLite. ECS tasks would connect to RDS through private subnets and security groups that allow database access only from the application tasks. Database migrations would run as a controlled deployment task.
    Application and container logs would be sent to Amazon CloudWatch Logs. I would monitor API error rates, response latency, CPU and memory utilisation, unhealthy tasks, and database connections. CloudWatch alarms could notify the team through Amazon SNS when error rates increase, tasks become unhealthy, or database resources approach capacity. ECS health checks and service auto-scaling would help maintain availability during changing traffic.

12. AI Tool Usage
    I used ChatGPT as a development assistant during this assignment. It helped with Laravel project structure, database design, tenant isolation, service-layer implementation, API development, and PHPUnit test scenarios. I executed the code locally, verified the migrations, tested all three endpoints using Postman, and ran the automated feature tests. I also reviewed and adapted the generated implementation to address MariaDB compatibility and database constraints. The final implementation and technical decisions were tested and reviewed locally before submission.
