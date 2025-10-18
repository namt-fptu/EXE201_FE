import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  compactFormat,
  standardFormat,
} from "../../../../app/admin/lib/format-number";
import Image from "next/image";
import { getTopProducts } from "../fetch";

export async function TopProducts() {
  const data = await getTopProducts();

  return (
    <div className="rounded-[10px] bg-white shadow-1">
      <div className="px-6 py-4 sm:px-7 sm:py-5 xl:px-8.5">
        <h2 className="text-2xl font-bold text-slate-900">Top Products</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] [&>th]:py-4 [&>th]:text-base [&>th]:text-slate-900 [&>th]:font-semibold">
            <TableHead className="min-w-[200px] xl:pl-7.5">Product</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-center">Sold</TableHead>
            <TableHead className="text-right xl:pr-7.5">Profit</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((product, index) => (
            <TableRow key={index} className="border-[#eee]">
              <TableCell className="min-w-[200px] xl:pl-7.5">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-slate-900 font-semibold">
                      {product.name}
                    </h5>
                    <p className="text-sm text-slate-600">#{index + 1}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-center">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                  {product.category}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <span className="font-semibold text-slate-900">
                  {product.price.toLocaleString("vi-VN")}₫
                </span>
              </TableCell>

              <TableCell className="text-center">
                <span className="font-semibold text-slate-900">
                  {compactFormat(product.sold)}
                </span>
              </TableCell>

              <TableCell className="text-right xl:pr-7.5">
                <span className="font-medium text-green">
                  ${standardFormat(product.profit)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
