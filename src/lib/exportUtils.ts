import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AdminStats {
  totalAdmins: number;
  superAdminCount: number;
  departmentAdminCount: number;
  departmentDistribution: Record<string, number>;
  recentRoleChanges: Array<{
    email: string;
    role: string;
    department: string | null;
    assigned_at: number;
  }>;
  departmentMetrics: Record<string, any>;
  totalTickets: number;
}

export function exportToCSV(data: AdminStats): void {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `admin-activity-report-${timestamp}.csv`;

  // Build CSV content
  let csv = "Admin Activity Report\n";
  csv += `Generated on: ${new Date().toLocaleString()}\n\n`;

  // Overview Statistics
  csv += "Overview Statistics\n";
  csv += "Metric,Value\n";
  csv += `Total Admins,${data.totalAdmins}\n`;
  csv += `Super Admins,${data.superAdminCount}\n`;
  csv += `Department Admins,${data.departmentAdminCount}\n`;
  csv += `Total Tickets,${data.totalTickets}\n\n`;

  // Department Distribution
  csv += "Department Admin Distribution\n";
  csv += "Department,Admin Count\n";
  Object.entries(data.departmentDistribution).forEach(([dept, count]) => {
    csv += `"${dept}",${count}\n`;
  });
  csv += "\n";

  // Department Ticket Metrics
  csv += "Department Ticket Metrics\n";
  csv += "Department,Total,Pending,In Progress,Resolved,Closed,Admin Count\n";
  Object.entries(data.departmentMetrics).forEach(([dept, metrics]: [string, any]) => {
    csv += `"${dept}",${metrics.total},${metrics.pending},${metrics.inProgress},${metrics.resolved},${metrics.closed},${metrics.adminCount}\n`;
  });
  csv += "\n";

  // Recent Role Changes
  csv += "Recent Role Changes (Last 30 Days)\n";
  csv += "Email,Role,Department,Date Assigned\n";
  data.recentRoleChanges.forEach((change) => {
    const date = new Date(change.assigned_at).toLocaleString();
    const role = change.role === "super_admin" ? "Super Admin" : "Department Admin";
    const dept = change.department || "All Departments";
    csv += `"${change.email}","${role}","${dept}","${date}"\n`;
  });

  // Create download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data: AdminStats): void {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `admin-activity-report-${timestamp}.pdf`;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Admin Activity Report", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 15;

  // Overview Statistics
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Overview Statistics", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: [
      ["Total Admins", data.totalAdmins.toString()],
      ["Super Admins", data.superAdminCount.toString()],
      ["Department Admins", data.departmentAdminCount.toString()],
      ["Total Tickets", data.totalTickets.toString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Department Distribution
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Department Admin Distribution", 14, yPos);
  yPos += 5;

  const deptDistributionData = Object.entries(data.departmentDistribution).map(
    ([dept, count]) => [dept, count.toString()]
  );

  autoTable(doc, {
    startY: yPos,
    head: [["Department", "Admin Count"]],
    body: deptDistributionData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Department Ticket Metrics
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Department Ticket Metrics", 14, yPos);
  yPos += 5;

  const metricsData = Object.entries(data.departmentMetrics).map(
    ([dept, metrics]: [string, any]) => [
      dept,
      metrics.total.toString(),
      metrics.pending.toString(),
      metrics.inProgress.toString(),
      metrics.resolved.toString(),
      metrics.closed.toString(),
    ]
  );

  autoTable(doc, {
    startY: yPos,
    head: [["Department", "Total", "Pending", "In Progress", "Resolved", "Closed"]],
    body: metricsData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14 },
    styles: { fontSize: 8 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page for recent changes
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Recent Role Changes
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Recent Role Changes (Last 30 Days)", 14, yPos);
  yPos += 5;

  if (data.recentRoleChanges.length > 0) {
    const roleChangesData = data.recentRoleChanges.map((change) => [
      change.email,
      change.role === "super_admin" ? "Super Admin" : "Dept Admin",
      change.department || "All Departments",
      new Date(change.assigned_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Email", "Role", "Department", "Date Assigned"]],
      body: roleChangesData,
      theme: "striped",
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14 },
      styles: { fontSize: 9 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No recent role changes in the past 30 days", 14, yPos + 5);
  }

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "Redeemer's University - Support Ticketing System",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }

  // Save the PDF
  doc.save(filename);
}
