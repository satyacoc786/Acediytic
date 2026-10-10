import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Student, CalendarEvent } from '../../types';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  BrainCircuit,
  BarChart3,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(user?.data || null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(!user?.data);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/students/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setStudent(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      fetch('/api/calendar')
        .then(res => res.json())
        .then(data => {
          if (data.events) {
            // Pick next 4 holidays or exams
            const relevant = data.events.filter((e: CalendarEvent) => e.event_type === 'Exam' || e.event_type === 'Holiday').slice(0, 4);
            setUpcomingEvents(relevant);
          }
        });
    }
  }, [user?.id]);

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 text-sm animate-pulse">Loading personalized student analytics...</div>
      </div>
    );
  }

  // Radar data for the 6 core pillars of the Success Score
  const radarData = [
    { subject: 'Academics (40%)', A: student.academic_score, fullMark: 100 },
    { subject: 'Attendance (25%)', A: student.attendance_score, fullMark: 100 },
    { subject: 'LMS Activity (10%)', A: student.lms_score, fullMark: 100 },
    { subject: 'Placement (10%)', A: student.placement_score, fullMark: 100 },
    { subject: 'Skills (10%)', A: student.technical_skill, fullMark: 100 },
    { subject: 'Engagement (5%)', A: student.engagement_score, fullMark: 100 },
  ];

  const midComparison = [
    { name: 'MID-1 Examination', score: student.mid_1_marks, max: 15 },
    { name: 'MID-2 Examination', score: student.mid_2_marks, max: 15 },
  ];

  const getRiskBadge = (level: string) => {
    if (level === 'Low') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Low Concern / On Track</span>
        </span>
      );
    }
    if (level === 'Moderate') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="h-3.5 w-3.5" />
          <span>Moderate Concern</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Priority Faculty Review</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {student.student_name}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
              {student.department} • {student.year_of_study} (Sem {student.semester})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Roll Number: <span className="font-mono font-semibold text-slate-700">{student.student_id}</span> • Academic Status: Active
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Overall Risk Category</div>
            <div className="mt-0.5">{getRiskBadge(student.risk_level)}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Success Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <span>Student Success Score</span>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-sky-600">{student.success_score}</span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Weighted holistic composite</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className={`text-3xl font-extrabold ${student.attendance_pct >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {student.attendance_pct}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {student.attendance_pct >= 75 ? 'Above mandatory threshold (75%)' : 'Caution: Below mandatory 75%'}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
            student.attendance_pct >= 75 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}>
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Cumulative CGPA */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current CGPA
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{student.cgpa}</span>
              <span className="text-xs font-semibold text-slate-400">/ 10.0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active Backlogs: <span className="font-semibold text-slate-800">{student.backlogs}</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Mid Exams Performance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mid-1 & Mid-2 Marks
            </div>
            <div className="mt-2 flex items-baseline space-x-3">
              <span className="text-xl font-bold text-slate-900">M1: <span className="text-sky-600">{student.mid_1_marks}</span>/15</span>
              <span className="text-xl font-bold text-slate-900">M2: <span className="text-cyan-600">{student.mid_2_marks}</span>/15</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Internal: <span className="font-semibold text-slate-800">{student.internal_marks}/100</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart: 6 Weighted Indicators */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Success Indicator Breakdown</h2>
              <p className="text-xs text-slate-500">Multidimensional metric profile normalized to 0-100</p>
            </div>
            <div className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
              Segment: {student.academic_placement_segment}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar name="My Score" dataKey="A" stroke="#0284c7" fill="#0ea5e9" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">LMS Logins (30d)</span>
              <span className="text-sm font-bold text-slate-800">{student.lms_logins_30d} logins</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Coding Assessment</span>
              <span className="text-sm font-bold text-slate-800">{student.coding_score} / 100</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Aptitude Score</span>
              <span className="text-sm font-bold text-slate-800">{student.aptitude_score} / 100</span>
            </div>
          </div>
        </div>

        {/* AI Explainable Prediction & Recommendations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-sky-600 font-bold text-base mb-1">
              <BrainCircuit className="h-5 w-5" />
              <h2>AI Performance Prediction</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Gradient Boosted ML Model Evaluation</p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Predicted Academic Support Need:</span>
                <span className="font-bold font-mono text-slate-900">
                  {Math.round(student.predicted_support_probability * 100)}% probability
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    student.predicted_support_probability > 0.6
                      ? 'bg-rose-500'
                      : student.predicted_support_probability > 0.3
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.round(student.predicted_support_probability * 100)}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <div className="font-semibold text-slate-700">Strongest Contributing Features:</div>
                <div className="flex justify-between">
                  <span>• Attendance Consistency:</span>
                  <span className="font-medium text-slate-800">{student.attendance_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>• MID Exam Normalized Average:</span>
                  <span className="font-medium text-slate-800">{(((student.mid_1_marks + student.mid_2_marks) / 30) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>• Active Backlogs:</span>
                  <span className="font-medium text-slate-800">{student.backlogs}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                <span>Actionable Recommendations</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                {student.attendance_pct < 75 && (
                  <li className="flex items-start space-x-2 bg-rose-50/70 p-2 rounded-lg text-rose-800">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Prioritize regular classroom attendance to recover past 75% regulatory requirement.</span>
                  </li>
                )}
                {student.placement_score < 60 && (
                  <li className="flex items-start space-x-2 bg-sky-50 p-2 rounded-lg text-sky-800">
                    <span className="text-sky-600 font-bold">•</span>
                    <span>Attend campus coding assessment workshops to boost technical interview readiness.</span>
                  </li>
                )}
                {student.mid_1_marks < 8 && (
                  <li className="flex items-start space-x-2 bg-amber-50 p-2 rounded-lg text-amber-800">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Reach out to faculty mentors during doubt clarification office hours for Mid-2 prep.</span>
                  </li>
                )}
                <li className="flex items-start space-x-2 bg-slate-50 p-2 rounded-lg text-slate-700">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Complete remaining LMS assignments to keep continuous evaluation score high.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
            Model version: v2.4 (Explainable Random Forest). Confidence interval: 95%.
          </div>
        </div>
      </div>

      {/* Upcoming College Events from Calendar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">Upcoming Academic Calendar Highlights</h2>
          </div>
          <span className="text-xs text-slate-400">Synced with College Academic Calendar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingEvents.map((evt, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  evt.event_type === 'Exam' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {evt.event_type}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-600">{evt.date}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">{evt.day_allocation}</h3>
              <p className="text-xs text-slate-500 mt-1">Week: {evt.week_count} • Code: {evt.day_count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
