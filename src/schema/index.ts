import { z } from 'zod'

export const OrderSchema = z.object({
  floor: z.string().optional(),
  table: z.string().optional(),
  total: z.number().min( 1, 'Hay errores en la Orden' ),
  orderType: z.enum(['DINE_IN', 'TAKE_AWAY', 'DELIVERY']),
  order: z.array( z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    subtotal: z.number(),
    uniqueId: z.string(),
    variationPrice: z.number(),
    selectedVariants: z.object({}).nullable(),
    selectedAdditionals: z.object({}).nullable(),
    notes: z.string().default("").nullable()
  }) ),
  client: z.object({
    fullName: z.string().optional(),
    dni: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  notes: z.string().default("").nullable()
})