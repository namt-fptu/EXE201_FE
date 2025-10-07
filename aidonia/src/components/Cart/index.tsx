"use client";
import React, { useState } from "react";
import Discount from "./Discount";
import OrderSummary from "./OrderSummary";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { toast } from "sonner";
import SingleItem from "./SingleItem";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";

const Cart = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const [isClearing, setIsClearing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleClearCart = async () => {
    if (cartItems.length === 0) {
      toast.info("Cart is already empty", {
        duration: 2000,
      });
      return;
    }

    setIsClearing(true);
    try {
      dispatch(removeAllItemsFromCart());
      toast.success("Cart cleared successfully", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to clear cart", {
        duration: 3000,
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      {/* <!-- ===== Breadcrumb Section Start ===== --> */}
      <section>
        <Breadcrumb title={"Cart"} pages={["Cart"]} />
      </section>
      {/* <!-- ===== Breadcrumb Section End ===== --> */}
      {cartItems.length > 0 ? (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">Your Cart</h2>
              <button 
                onClick={handleClearCart}
                disabled={isClearing || cartItems.length === 0}
                className="flex items-center gap-2 text-blue hover:text-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isClearing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue rounded-full animate-spin"></div>
                    Clearing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Shopping Cart
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-7.5">
                    <div className="min-w-[400px]">
                      <p className="text-dark">Product</p>
                    </div>

                    <div className="min-w-[180px]">
                      <p className="text-dark">Price</p>
                    </div>

                    <div className="min-w-[275px]">
                      <p className="text-dark">Quantity</p>
                    </div>

                    <div className="min-w-[200px]">
                      <p className="text-dark">Subtotal</p>
                    </div>

                    <div className="min-w-[50px]">
                      <p className="text-dark text-right">Action</p>
                    </div>
                  </div>

                  {/* <!-- cart item --> */}
                  {cartItems.length > 0 &&
                    cartItems.map((item, key) => (
                      <SingleItem item={item} key={key} />
                    ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11 mt-9">
              <Discount />
              <OrderSummary />
            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[600px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[20px] shadow-1 p-8 md:p-12 text-center">
              {/* Enhanced Empty Cart Icon */}
              <div className="mx-auto mb-8 w-32 h-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-full">
                <svg
                  className="w-16 h-16 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </div>

              {/* Friendly Message */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-dark mb-3">
                  Your cart is empty
                </h2>
                <p className="text-body-color text-lg leading-relaxed">
                  Looks like you haven't added any items to your cart yet.
                  <br />
                  Start exploring our amazing products!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop-with-sidebar"
                  className="inline-flex items-center justify-center gap-2 font-medium text-white bg-blue hover:bg-blue-dark py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Start Shopping
                </Link>
                
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 font-medium text-dark bg-gray-2 hover:bg-gray-3 py-4 px-8 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-3">
                <p className="text-body-color text-sm">
                  Need help? 
                  <Link href="/contact" className="text-blue hover:text-blue-dark ml-1 underline">
                    Contact our support team
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Cart;
