"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/admin/ui/dropdown";
import Link from "next/link";
import { useState } from "react";

// Bell Icon component
const BellIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const notifications = [
  {
    id: 1,
    title: "New message received",
    message: "You have received a new message from John Doe",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    title: "Package updated",
    message: "Premium package has been updated successfully",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 3,
    title: "System maintenance",
    message: "Scheduled maintenance will begin at 2:00 AM",
    time: "3 hours ago",
    read: false,
  },
];

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationList, setNotificationList] = useState(notifications);

  const unreadCount = notificationList.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        className="w-80 border border-stroke bg-white shadow-md"
        align="end"
      >
        <div className="border-b border-stroke px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notificationList.length > 0 ? (
            notificationList.map((notification) => (
              <div
                key={notification.id}
                className={`border-b border-stroke px-4 py-3 hover:bg-gray-1 cursor-pointer ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2 w-2 rounded-full ${
                      !notification.read ? "bg-primary" : "bg-gray-4"
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-dark">
                      {notification.title}
                    </h4>
                    <p className="mt-1 text-xs text-gray-6">
                      {notification.message}
                    </p>
                    <span className="mt-2 text-xs text-gray-5">
                      {notification.time}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-6">No notifications yet</p>
            </div>
          )}
        </div>

        <div className="border-t border-stroke px-4 py-3">
          <Link
            href="/admin/notifications"
            className="block w-full text-center text-sm text-primary hover:underline"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
