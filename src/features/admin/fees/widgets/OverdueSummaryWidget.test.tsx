// ...existing code...
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OverdueSummaryWidget from "./OverdueSummaryWidget";
import axiosInstance from "@/api/axiosInstance";

jest.mock("@/api/axiosInstance");

const mockStudents = [
  {
    dueRecordId: "1",
    studentId: "S1",
    name: "Alice",
    phone: "1234567890",
    email: "alice@example.com",
    libraryId: "L1",
    monthlyFee: 1000,
    monthsDue: ["Jan", "Feb"],
    totalDueAmount: 2000,
    daysOverdue: 10,
    lastReminderSentAt: null,
    nextReminderDue: null,
    reminderCount: 0,
    escalationLevel: 1,
    urgency: "red",
    dueSince: null,
  },
  {
    dueRecordId: "2",
    studentId: "S2",
    name: "Bob",
    phone: "9876543210",
    email: "bob@example.com",
    libraryId: "L2",
    monthlyFee: 1200,
    monthsDue: ["Jan"],
    totalDueAmount: 1200,
    daysOverdue: 5,
    lastReminderSentAt: null,
    nextReminderDue: null,
    reminderCount: 1,
    escalationLevel: 1,
    urgency: "orange",
    dueSince: null,
  },
];

const mockData = {
  students: mockStudents,
  totals: {
    totalStudentsOverdue: 2,
    totalOutstandingAmount: 3200,
    critical: 0,
    red: 1,
    orange: 1,
    yellow: 0,
    mild: 0,
  },
};

jest.mock("../hooks/useFees", () => ({
  useOverdueSummary: () => ({
    data: mockData,
    isLoading: false,
    refetch: jest.fn(),
    isFetching: false,
  }),
}));

describe("OverdueSummaryWidget", () => {
  it("renders students and allows selection", () => {
    render(<OverdueSummaryWidget />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(1); // select all + per student
  });

  it("enables bulk reminder button when students are selected", async () => {
    render(<OverdueSummaryWidget />);
    const studentCheckbox = screen.getAllByRole("checkbox")[1];
    fireEvent.click(studentCheckbox);
    const bulkButton = screen.getByText(/Send Bulk Reminder/);
    expect(bulkButton).not.toBeDisabled();
  });

  it("calls bulk reminder API on click", async () => {
    (axiosInstance.post as jest.Mock).mockResolvedValue({});
    render(<OverdueSummaryWidget />);
    const studentCheckbox = screen.getAllByRole("checkbox")[1];
    fireEvent.click(studentCheckbox);
    const bulkButton = screen.getByText(/Send Bulk Reminder/);
    fireEvent.click(bulkButton);
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/fees/send-bulk-overdue-reminders",
        expect.objectContaining({ dueRecordIds: ["1"] }),
      );
    });
  });

  it("calls export CSV API and triggers download", async () => {
    const blob = new Blob(["csvdata"], { type: "text/csv" });
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: blob });
    render(<OverdueSummaryWidget />);
    const exportButton = screen.getByText(/Export CSV/);
    fireEvent.click(exportButton);
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/fees/export-overdue-summary-csv",
        expect.objectContaining({ responseType: "blob" }),
      );
    });
  });
});
