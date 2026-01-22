import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TopicWithScore, Project, ESGCategory } from '@/types/esg';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportToolsProps {
  project: Project;
  topics: TopicWithScore[];
}

export function ExportTools({ project, topics }: ExportToolsProps) {
  const [exporting, setExporting] = useState(false);

  const scoredTopics = topics.filter(t => t.materiality_score !== undefined);

  const getExportData = () =>
    scoredTopics.map(topic => ({
      'Project Name': project.name,
      'ESG Category': topic.category.charAt(0).toUpperCase() + topic.category.slice(1),
      'Topic Name': topic.name,
      'Description': topic.description || '',
      'Stakeholder Importance': topic.stakeholder_importance || 0,
      'Business Impact': topic.business_impact || 0,
      'Materiality Score': topic.materiality_score || 0,
    }));

  const exportToExcel = () => {
    setExporting(true);
    try {
      const data = getExportData();
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Materiality Assessment');

      // Auto-size columns
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String((row as any)[key]).length)) + 2,
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `${project.name.replace(/\s+/g, '_')}_ESG_Assessment.xlsx`);
      toast.success('Excel file downloaded');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const data = getExportData();
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(h => `"${String((row as any)[h]).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${project.name.replace(/\s+/g, '_')}_ESG_Assessment.csv`;
      link.click();
      toast.success('CSV file downloaded');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV file');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.setTextColor(45, 157, 95); // Primary green
      doc.text('ESG Materiality Assessment', 14, 20);

      // Project name
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Project: ${project.name}`, 14, 30);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);

      // Table
      const tableData = scoredTopics.map(topic => [
        topic.category.charAt(0).toUpperCase() + topic.category.slice(1),
        topic.name,
        topic.stakeholder_importance?.toString() || '-',
        topic.business_impact?.toString() || '-',
        topic.materiality_score?.toString() || '-',
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Category', 'Topic', 'Stakeholder', 'Business', 'Score']],
        body: tableData,
        headStyles: {
          fillColor: [45, 157, 95],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 250, 247],
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
      });

      doc.save(`${project.name.replace(/\s+/g, '_')}_ESG_Assessment.pdf`);
      toast.success('PDF file downloaded');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF file');
    } finally {
      setExporting(false);
    }
  };

  if (scoredTopics.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          disabled={exporting}
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-blue-600" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
          <File className="h-4 w-4 text-red-600" />
          PDF (.pdf)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
