'use client'
import { CartItem } from "./cart-item"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/shared/table"
import { type Item } from "@/hooks/use-cart";

interface CartItemListProps {
	items: Item[]
}

export function CartItemList({ items }: CartItemListProps) {
	
	return (
		<Table>
			<TableHeader>
				<TableRow className="sm:border-b-2">
					<TableHead className="w-[100px]">Product</TableHead>
					<TableHead className="w-[500px]"></TableHead>
					<TableHead >Price</TableHead>
					<TableHead >Quantity</TableHead>
					<TableHead className="w-[100px]">Total</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{items?.map((item) => (
					<CartItem key={item?.id} item={item} />
				))}
			</TableBody>
		</Table>
	)
}

