import { useQuery } from "@tanstack/react-query";
import { fetchStudentProfile, fetchAdminProfile } from "../api/profileApi";
import { useSessionStore } from "../../../stores/sessionStore";

// This hook will auto-select the correct profile API based on user role from session
export function useProfile() {
  const { role, token } = useSessionStore();
  const isStudent = role === "STUDENT" && !!token;
  const isAdmin = (role === "ADMIN" || role === "SUPER_ADMIN") && !!token;

  const studentQuery = useQuery({
    queryKey: ["profile", "student"],
    queryFn: fetchStudentProfile,
    enabled: isStudent,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const adminQuery = useQuery({
    queryKey: ["profile", "admin"],
    queryFn: fetchAdminProfile,
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (!token || !role) return { data: null, isLoading: false, error: null };
  return isStudent ? studentQuery : adminQuery;
}
