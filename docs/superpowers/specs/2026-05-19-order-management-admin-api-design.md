# Design Spec - Order Management API (Admin)

## Goals
Provide administrators with the ability to list orders with pagination and filtering, and update order statuses.

## Architecture
- **Controller**: `OrdersController` will be extended with new endpoints.
- **Service**: `OrdersService` will implement the logic for fetching and updating orders.
- **DTOs**: New DTOs for querying and updating status.

## Data Models
Uses the existing `Order` model in Prisma.

## API Endpoints

### 1. List Orders
- **Endpoint**: `GET /orders`
- **Query Parameters**:
  - `status`: Optional string to filter by status.
  - `skip`: Optional number for pagination offset.
  - `take`: Optional number for pagination limit.
- **Response**: Array of Order objects including their items.

### 2. Update Order Status
- **Endpoint**: `PATCH /orders/:id/status`
- **Body**:
  - `status`: Required string (PENDING, SHIPPING, SUCCESS, CANCELLED).
- **Response**: The updated Order object.

## Implementation Plan
1. Create `OrderQueryDto` and `UpdateOrderStatusDto`.
2. Implement `findAll` in `OrdersService`.
3. Implement `updateStatus` in `OrdersService`.
4. Add corresponding methods to `OrdersController`.
5. Write unit tests in `orders.service.spec.ts`.

## Verification Plan
- Run unit tests: `npm run test apps/api/src/orders/orders.service.spec.ts`
- Manual verification via API calls (if possible in this environment).
