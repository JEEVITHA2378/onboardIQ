import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Button } from '../../components/Button';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { ingestResume, getSimulationTasks } from '../../services/api';
import { useOnboard } from '../../context/OnboardContext';
import { FileText, Briefcase, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

export default function Upload() {
  const navigate = useNavigate();
  const { setSimulationTasks, setSessionId } = useOnboard();
  const { user } = useAuth();
  
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'resume') setResume(file);
    else setJd(file);
  };

  const handleUpload = async () => {
    if (!resume || !jd) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('job_description', jd);
    formData.append('user_id', user.id);

    try {
      let extractedData = {};
      try {
        const resp = await ingestResume(formData);
        extractedData = resp.data;
      } catch (err) {
        console.error('Backend ingest failed:', err);
        // Use fallback data if backend is down
        extractedData = {
          role_title: 'Software Engineer',
          role_category: 'technical',
          session_id: crypto.randomUUID()
        };
      }

      // Create session in Supabase immediately
      const newSessionId = extractedData.session_id || crypto.randomUUID();

      const { error } = await supabase
        .from('onboarding_sessions')
        .insert({
          id: newSessionId,
          user_id: user.id,
          role_title: extractedData.role_title || 'Software Engineer',
          role_category: extractedData.role_category || 'technical',
          status: 'in_progress',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Session creation failed:', error);
      }

      // Save to context
      setSessionId(newSessionId);
      
      try {
        const tasksResp = await getSimulationTasks(newSessionId);
        setSimulationTasks(tasksResp.data?.tasks || []);
      } catch (e) {
        setSimulationTasks([
          { id: "task_1", title: "API Endpoint Debugging", type: "code", description: "The `/users` endpoint is returning a 500 error when filtering by age. Review the logic and fix the bug to restore correct pagination and filtering." },
          { id: "task_2", title: "Architecture Decision Record", type: "text", description: "Draft a brief ADR explaining why we should migrate from REST to GraphQL for the new notification service." }
        ]);
      }
      
      setTimeout(() => navigate(ROUTES.SIMULATION), 1000);
    } catch (err) {
      console.error('Upload failed:', err);
      setLoading(false);
    }
  };

  const UploadCard = ({ type, title, icon: Icon, file }) => (
    <div className={`bg-white border-2 border-dashed rounded-[14px] p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 shadow-soft ${file ? 'border-primary-dark border-solid bg-[#f8fafc]' : 'border-border hover:border-primary-dark/50 hover:bg-[#f8fafc]'}`}>
      <input 
        type="file" 
        accept=".pdf,.docx,.txt"
        onChange={(e) => handleFileChange(e, type)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
      />
      {file ? (
        <CheckCircle2 className="w-8 h-8 mb-4 text-green" />
      ) : (
        <Icon className="w-8 h-8 mb-4 text-primary-dark" />
      )}
      <h3 className="font-headline font-semibold text-[15px] text-primary-dark mb-1">{title}</h3>
      
      {file ? (
        <p className="font-mono text-[13px] text-primary-dark text-center mt-1">{file.name}</p>
      ) : (
        <>
          <p className="font-body text-sm text-muted text-center mb-1">Drag and drop or click to upload</p>
          <p className="font-mono text-[11px] text-[#94a3b8] tracking-wide uppercase">PDF or DOCX · Max 5MB</p>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-transparent relative">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 z-10">
        <div className="max-w-3xl w-full text-center mb-16">
          <h1 className="font-headline text-[54px] text-primary-dark leading-[1.1] mb-4">
            We don't take<br/>
            <span className="relative inline-block">
              your word
              <svg className="absolute w-[110%] h-4 top-1/2 -left-[5%] -translate-y-1/2 text-red pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
                <motion.path 
                  d="M0 10 Q 50 15 100 8" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  initial={{ pathLength: 0 }} 
                  animate={{ pathLength: 1 }} 
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
            </span>
            {' '}for it.
          </h1>
          <p className="font-body text-muted text-lg">
            Upload your Resume and Job Description. We'll observe what you actually know.
          </p>
        </div>

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <UploadCard type="resume" title="Your Resume" icon={FileText} file={resume} />
          <UploadCard type="jd" title="Job Description" icon={Briefcase} file={jd} />
        </div>

        <div className="flex justify-center w-full max-w-4xl">
          <Button 
            onClick={handleUpload} 
            disabled={!resume || !jd}
            className={`w-full md:w-auto min-w-[280px] h-14 rounded-[12px] font-bold text-base transition-colors ${(!resume || !jd) ? '!bg-[#94a3b8] !text-white opacity-100 cursor-not-allowed border-none' : ''}`}
          >
            Begin Assessment →
          </Button>
        </div>
      </main>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center"
          >
            <div className="w-8 h-8 border-4 border-[#e2e8f0] border-t-primary-dark rounded-full animate-spin mb-6" />
            <h2 className="font-headline text-2xl text-primary-dark">Parsing your documents...</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
