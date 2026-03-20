import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useOnboard } from '../../context/OnboardContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/Button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard() {
  const { user } = useAuth();
  const { pathway } = useOnboard();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [expandedTrace, setExpandedTrace] = useState({});
  const [downloading, setDownloading] = useState(false);
  const dashboardRef = useRef(null);

  const mockData = {
    readiness: 72,
    modules: 6,
    skipped: 14,
    daysToReady: 4.5,
    barData: [
      { name: 'Python', claimed: 90, proven: 75 },
      { name: 'React', claimed: 85, proven: 80 },
      { name: 'SysDsn', claimed: 70, proven: 40 },
      { name: 'CI/CD', claimed: 60, proven: 85 }
    ],
    pieData: [
      { name: 'Proven', value: 14, color: '#10b981' },
      { name: 'Gap', value: 6, color: '#f59e0b' },
      { name: 'Skipped', value: 2, color: '#e2e8f0' }
    ],
    traces: [
      { id: 1, type: 'Technical', title: 'Advanced Python Concurrency', diff: 'hard', desc: 'Identified race conditions in Task 2 concurrent request handler resulting in an 85% thread collision rate.' },
      { id: 2, type: 'Operational', title: 'Incident Response SOP', diff: 'medium', desc: 'Alert triage timing was outside 10 minute SLO SLA during the mock PagerDuty simulation.' },
      { id: 3, type: 'Soft Skills', title: 'Cross-functional Communication', diff: 'easy', desc: 'The feedback provided to the mock junior developer lacked constructive framing, indexing heavily on raw criticism.' }
    ]
  };

  const AnimatedNumber = ({ target }) => {
    const [num, setNum] = useState(0);
    useEffect(() => {
      let interval = setInterval(() => {
        setNum(p => {
          if (p >= target) { clearInterval(interval); return target; }
          return p + (target / 30);
        });
      }, 50);
      return () => clearInterval(interval);
    }, [target]);
    return <span>{Math.floor(num)}</span>;
  };

  const Card = ({ label, target, color, suffix='' }) => (
    <div className="bg-white border border-border shadow-soft rounded-[12px] p-[20px] relative overflow-hidden flex flex-col justify-between h-[120px]">
      <div className="font-mono text-[11px] text-[#64748b] uppercase tracking-wider">{label}</div>
      <div className="font-headline text-[32px] text-primary-dark font-bold leading-none">
        <AnimatedNumber target={target} />{suffix}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[3px]" style={{ backgroundColor: color }} />
    </div>
  );

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById('dashboard-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      // Add header to PDF
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('OnboardIQ+ Assessment Report', pdfWidth / 2, 15,
        { align: 'center' });

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}`, pdfWidth / 2, 22, { align: 'center' });

      // Add dashboard screenshot
      pdf.addImage(
        imgData, 'PNG',
        imgX, 30,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Add second page with reasoning trace text
      const reasoningTrace = mockData.traces.map(t => ({ module_title: t.title, explanation: t.desc }));
      
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Reasoning Trace', 20, 20);

      let yPosition = 35;
      if (reasoningTrace && reasoningTrace.length > 0) {
        reasoningTrace.forEach((item, index) => {
          if (yPosition > 260) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text(`${index + 1}. ${item.module_title}`, 20, yPosition);
          yPosition += 7;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 116, 139);
          const splitText = pdf.splitTextToSize(item.explanation, 170);
          pdf.text(splitText, 20, yPosition);
          yPosition += splitText.length * 5 + 8;
        });
      }

      // Add footer to every page
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(
          `OnboardIQ+ · Proof-Based Onboarding Report · Page ${i} of ${totalPages}`,
          pdfWidth / 2,
          pdf.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `OnboardIQ_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Navbar />
      
      <main ref={dashboardRef} id="dashboard-content" className="max-w-[1280px] w-full mx-auto px-6 py-10 flex-grow">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card label="Job Readiness" target={mockData.readiness} suffix="%" color="#0ea5e9" />
          <Card label="Modules in Path" target={mockData.modules} color="#0f172a" />
          <Card label="Modules Skipped" target={mockData.skipped} color="#10b981" />
          <Card label="Days to Role Ready" target={mockData.daysToReady} color="#f59e0b" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-border rounded-[12px] shadow-soft p-6">
            <h3 className="font-headline text-[15px] font-bold text-primary-dark mb-6">Skill Proof vs Claimed</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.barData} layout="vertical" barSize={16}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} fontFamily='"JetBrains Mono"' axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="claimed" name="Claimed %" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="proven" name="Proven %" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-border rounded-[12px] shadow-soft p-6 flex flex-col">
            <h3 className="font-headline text-[15px] font-bold text-primary-dark">Skills Breakdown</h3>
            <div className="flex-grow relative flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <span className="font-headline text-[24px] font-bold text-primary-dark">22</span>
                <span className="font-mono text-[10px] text-muted">TOTAL SKILLS</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Tooltip wrapperStyle={{ zIndex: 100 }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                  <Pie data={mockData.pieData} innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                    {mockData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Reasoning Trace Accordion */}
        <div className="bg-white border border-border rounded-[12px] shadow-soft">
          <div className="border-b border-border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-headline text-[16px] font-bold text-primary-dark">Reasoning Trace</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Technical', 'Operational', 'Soft Skills'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-[11px] font-mono rounded-[6px] transition-colors ${filter === f ? 'bg-primary-dark text-white' : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 flex flex-col gap-2">
            {mockData.traces.filter(t => filter === 'All' || t.type === filter).map(trace => {
              const open = expandedTrace[trace.id];
              return (
                <div key={trace.id} className="border border-border rounded-[8px] overflow-hidden">
                  <div 
                    onClick={() => setExpandedTrace(p => ({ ...p, [trace.id]: !p[trace.id] }))}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="font-body text-[14px] text-primary-dark font-medium">{trace.title}</div>
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-0.5 rounded-[4px] font-mono text-[10px] uppercase ${trace.diff === 'hard' ? 'bg-[#fee2e2] text-[#991b1b]' : trace.diff === 'medium' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#dcfce7] text-[#166534]'}`}>
                        {trace.diff}
                      </div>
                      {open ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-4 pt-0">
                          <div className="border border-border bg-[#f8fafc] rounded-[8px] p-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#0ea5e9]" />
                            <p className="font-body text-[14px] italic text-[#64748b] m-0 leading-relaxed">
                              "{trace.desc}"
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-border px-8 py-4 flex flex-col sm:flex-row justify-between items-center z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.02)] gap-4">
        <span className="font-mono text-[12px] text-[#64748b]">Session: March 20, 2026 — 14:30 EST</span>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{
              background: downloading ? '#94a3b8' : '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 24px',
              fontFamily: 'DM Sans',
              fontSize: '14px',
              fontWeight: '500',
              color: '#0f172a',
              cursor: downloading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 200ms'
            }}
            onMouseEnter={e => {
              if (!downloading) e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            {downloading ? (
              <>
                <div style={{
                  width: '14px', height: '14px',
                  border: '2px solid #94a3b8',
                  borderTopColor: '#0f172a',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                Generating PDF...
              </>
            ) : (
              <>
                ↓ Download PDF
              </>
            )}
          </button>
          <Button onClick={() => navigate(ROUTES.ROADMAP)} className="flex-1 sm:flex-auto px-5 h-[44px] text-sm font-semibold rounded-[8px]">View My Roadmap</Button>
        </div>
      </div>
    </div>
  );
}
