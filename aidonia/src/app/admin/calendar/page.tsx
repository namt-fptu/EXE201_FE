"use client";

import Breadcrumb from "@/components/admin/Breadcrumbs/Breadcrumb";
import CalendarBox from "@/components/admin/CalenderBox";
import { ProtectedRoute } from "@/components/Common/ProtectedRoute";

const CalendarPage = () => {
  return (
    <ProtectedRoute requiredRoles={['admin']} message="You need admin privileges to access calendar.">
      <Breadcrumb pageName="Calendar" />

      <CalendarBox />
    </ProtectedRoute>
  );
};

export default CalendarPage;
