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

export type ReceiptStatus = 'DRAFT' | 'VALIDATED' | 'CANCELED';

export interface ReceiptItem {
  id?: string;
  receipt_id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_cost?: number;
}

export type ReceiptLine = ReceiptItem;

export interface ReceiptItemCreate {
  product_id: string;
  quantity: number;
}

export interface ReceiptCreate {
  reference: string;
  supplier_id: string;
  items: ReceiptItemCreate[];
}

export interface ReceiptValidate {
  location_id: string;
}

export interface ReceiptResponse {
  id: string;
  reference: string;
  supplier_id: string;
  status: ReceiptStatus;
}

export interface Receipt extends ReceiptResponse {
  supplier?: string;
  warehouse_id?: string | number;
  warehouse_name?: string;
  scheduled_date?: string;
  created_at?: string;
  items?: ReceiptItem[];
  lines?: ReceiptItem[];
}

// ─── Delivery Orders ──────────────────────────────────────────────────────────

export type DeliveryStatus = 'DRAFT' | 'VALIDATED' | 'CANCELED';

export interface DeliveryItem {
  id?: string;
  delivery_id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
}

export type DeliveryOrderLine = DeliveryItem;

export interface DeliveryItemCreate {
  product_id: string;
  quantity: number;
}

export interface DeliveryOrderCreate {
  reference: string;
  source_location_id: string;
  items: DeliveryItemCreate[];
}

export interface DeliveryResponse {
  id: string;
  reference: string;
  source_location_id: string;
  status: DeliveryStatus;
}

export interface DeliveryOrder extends DeliveryResponse {
  customer?: string;
  source_location_name?: string;
  warehouse_id?: string | number;
  warehouse_name?: string;
  scheduled_date?: string;
  created_at?: string;
  items?: DeliveryItem[];
  lines?: DeliveryItem[];
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

export interface AdjustmentLine {
  id: number;
  adjustment_id: number;
  product_id: number;
  product_name?: string;
  location_id: number;
  location_name?: string;
  theoretical_qty: number;
  real_qty: number;
  difference: number;
}

export interface InventoryAdjustment {
  id: number;
  reference: string;
  warehouse_id: number;
  warehouse_name?: string;
  status: AdjustmentStatus;
  reason?: string;
  created_at: string;
  lines?: AdjustmentLine[];
}

export interface InventoryAdjustmentCreate {
  warehouse_id: number;
  reason?: string;
  lines?: Array<{
    product_id: number;
    location_id: number;
    real_qty: number;
  }>;
}
