'use client';

import React, {useState} from "react";
import TopBar from "@/components/category/top-bar";
import DrawerFilter from "@/components/category/drawer-filter";
import {LIMITS} from "@/services/utils/limits";
import {useGetAllProductsInfiniteQuery} from "@/store/productsApi";
import {usePathname} from "next/navigation";
import useQueryParam from "@/utils/use-query-params";
import {ProductMain} from "@/components/product/productListing/product-main";

export default function CanvasContent() {
	const [viewAs, setViewAs] = useState(Boolean(true));
	const pathname = usePathname();
	const { getParams, query } = useQueryParam(pathname ?? '/');
	const newQuery: { sort_by?: string } = getParams(
		`${process.env.NEXT_PUBLIC_WEBSITE_URL}${query}`,
	);
	void newQuery;
	const limit = LIMITS.PRODUCTS_LIMITS;
	const { data: pages, isLoading } = useGetAllProductsInfiniteQuery({
		pageSize: limit,
	});
	const data = pages?.pages?.[0]?.content;
	
	
	return (
		<div className=" products-category">
			
			<div className="w-full">
				<div className={"lg:flex"}>
					<DrawerFilter  isDesktop={true}/>
					<TopBar viewAs={viewAs} setViewAs={setViewAs}/>
				</div>
				<ProductMain data={data} isLoading={isLoading} viewAs={viewAs}/>
			</div>
		</div>
	
	);
}
