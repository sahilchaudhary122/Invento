// ─── Shared ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// ─── Warehouse / Location ─────────────────────────────────────────────────────

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address?: string;
  created_at: string;
}

export interface Location {
  id: number;
  warehouse_id: number;
  warehouse_name?: string;
  name: string;
  code: string;
  location_type: 'input' | 'output' | 'internal' | 'supplier' | 'customer' | 'virtual';
  created_at: string;
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

export type ReceiptStatus = 'draft' | 'confirmed' | 'done' | 'cancelled';

export interface ReceiptLine {
  id: number;
  receipt_id: number;
  product_id: number;
  product_name?: string;
  expected_qty: number;
  received_qty: number;
  uom?: string;
}

export interface Receipt {
  id: number;
  reference: string;
  supplier?: string;
  warehouse_id: number;
  warehouse_name?: string;
  status: ReceiptStatus;
  scheduled_date?: string;
  created_at: string;
  lines?: ReceiptLine[];
}

export interface ReceiptCreate {
  supplier?: string;
  warehouse_id: number;
  scheduled_date?: string;
  lines?: Array<{
    product_id: number;
    expected_qty: number;
    uom?: string;
  }>;
}

// ─── Delivery Orders ──────────────────────────────────────────────────────────

export type DeliveryStatus = 'draft' | 'ready' | 'done' | 'cancelled';

export interface DeliveryOrderLine {
  id: number;
  delivery_order_id: number;
  product_id: number;
  product_name?: string;
  qty: number;
  uom?: string;
}

export interface DeliveryOrder {
  id: number;
  reference: string;
  customer?: string;
  warehouse_id: number;
  warehouse_name?: string;
  status: DeliveryStatus;
  scheduled_date?: string;
  created_at: string;
  lines?: DeliveryOrderLine[];
}

export interface DeliveryOrderCreate {
  customer?: string;
  warehouse_id: number;
  scheduled_date?: string;
  lines?: Array<{
    product_id: number;
    qty: number;
    uom?: string;
  }>;
}

// ─── Internal Transfers ───────────────────────────────────────────────────────

export type TransferStatus = 'draft' | 'confirmed' | 'done' | 'cancelled';

export interface TransferLine {
  id: number;
  transfer_id: number;
  product_id: number;
  product_name?: string;
  qty: number;
  uom?: string;
}

export interface InternalTransfer {
  id: number;
  reference: string;
  from_location_id: number;
  to_location_id: number;
  from_location_name?: string;
  to_location_name?: string;
  status: TransferStatus;
  scheduled_date?: string;
  created_at: string;
  lines?: TransferLine[];
}

export interface InternalTransferCreate {
  from_location_id: number;
  to_location_id: number;
  scheduled_date?: string;
  lines?: Array<{
    product_id: number;
    qty: number;
    uom?: string;
  }>;
}

// ─── Inventory Adjustments ────────────────────────────────────────────────────

export type AdjustmentStatus = 'draft' | 'validated' | 'cancelled';

export interface AdjustmentItemCreate {
  product_id: string;
  physical_quantity: number;
}

export interface InventoryAdjustmentCreate {
  reference: string;
  location_id: string;
  reason: string;
  items: AdjustmentItemCreate[];
}

export interface AdjustmentLine {
  id: string | number;
  adjustment_id: string | number;
  product_id: string | number;
  product_name?: string;
  system_quantity?: number;
  physical_quantity?: number;
  difference?: number;
}

export interface InventoryAdjustment {
  id: string | number;
  reference: string;
  location_id: string;
  location_name?: string;
  status: AdjustmentStatus;
  reason?: string;
  created_at: string;
  items?: AdjustmentLine[];
  lines?: AdjustmentLine[];
}

// ─── Products / Inventory ─────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  category_name?: string;
  unit_of_measure: string;
  reorder_threshold: number;
  is_active: boolean;
  created_at: string;
  stock_on_hand?: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_receipts: number;
  pending_deliveries: number;
  pending_transfers: number;
}

export interface StockActivity {
  id: number;
  date: string;
  product_name: string;
  operation_type: string;
  reference: string;
  quantity: number;
  status: string;
}

// ─── Ledger ───────────────────────────────────────────────────────────────────

export interface LedgerEntry {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  operation_type: string;
  reference: string;
  source_location_name: string;
  dest_location_name: string;
  qty_done: number;
  previous_qty: number;
  new_qty: number;
  user_name: string;
  created_at: string;
}
