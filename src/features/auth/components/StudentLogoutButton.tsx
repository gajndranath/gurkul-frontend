import React from "react";
import { Button } from "../../../components/ui/button";
import { useLogoutStudent } from "../hooks/useStudentAuth";

const StudentLogoutButton: React.FC = () => {
  const { mutate, status } = useLogoutStudent();

  return (
    <Button
      onClick={() => mutate()}
      disabled={status === "pending"}
      variant="outline"
      className="w-full"
    >
      {status === "pending" ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default StudentLogoutButton;
