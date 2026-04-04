# To Test - Fase 2: Base de Datos (Model Layer)

## Pre-requisitos
- [ ] Docker Compose levantado (`docker compose up -d`)
- [ ] PostgreSQL accesible en `db:5432`

## Migración
- [ ] La migración `0001_initial` se aplica sin errores al levantar el container (`prisma migrate deploy`)
- [ ] Verificar en Adminer (http://localhost:8080) que existen las tablas: `Product`, `Customer`, `Order`, `Cart`, `ImportedCategory`
- [ ] Verificar que el enum `OrderStatus` existe con los valores correctos: PAID, PENDING_AE_ORDER, AE_ORDER_PLACED, AE_ORDER_FAILED, SHIPPED, DELIVERED, REFUNDED, CANCELLED

## Modelos y Relaciones
- [ ] Crear un `ImportedCategory` y verificar que se guarda correctamente
- [ ] Crear un `Product` asociado a una categoría y verificar la relación FK
- [ ] Crear un `Customer` con email único y verificar constraint unique
- [ ] Intentar crear dos customers con el mismo email → debe fallar (unique constraint)
- [ ] Crear un `Cart` asociado a un customer (por `customerId`) y verificar relación 1:1
- [ ] Crear un `Cart` con `sessionId` (sin customer) para visitantes anónimos
- [ ] Crear una `Order` con status por defecto `PAID` y verificar que `orderNumber` se genera automáticamente
- [ ] Verificar que `Order.items` acepta JSON válido con productos, variantes, cantidades
- [ ] Verificar que `Order.paypalRawResponse` acepta JSON complejo
- [ ] Verificar que `Order.aliexpressOrderId` es nullable (puede ser null al inicio)
- [ ] Verificar campos `Decimal` (basePrice, salePrice, totalPaid) almacenan correctamente con 2 decimales

## Relaciones Jerárquicas
- [ ] Crear categorías padre-hijo (self-relation `CategoryTree`) y verificar que `parent` y `children` funcionan
- [ ] Verificar cascading: al eliminar una categoría padre, los hijos quedan con `parentId = null` (SET NULL)

## Prisma Client
- [ ] Importar `prisma` desde `src/lib/models/index.ts` en un Server Component o Route Handler
- [ ] Ejecutar un `prisma.product.findMany()` y verificar que retorna array vacío (sin errores)
- [ ] Ejecutar un `prisma.product.create()` con datos válidos y verificar que se persiste

## Build
- [x] `next build` compila sin errores de TypeScript
- [x] `prisma generate` genera el cliente correctamente en `src/generated/prisma/`
