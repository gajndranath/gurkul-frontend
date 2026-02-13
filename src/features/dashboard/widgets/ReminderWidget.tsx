import React from "react";
import RemindersPage from "../../reminders/admin-reminders/components/RemindersPage";

const ReminderWidget: React.FC = () => {
  return (
    <div className="w-full">
      <RemindersPage />
    </div>
  );
};

export default React.memo(ReminderWidget);
