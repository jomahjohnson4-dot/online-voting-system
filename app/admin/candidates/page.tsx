import ExportCandidateActions from '../../../../components/ExportCandidateActions';

export default function AdminCandidatesPage() {
  return (
    <main className="p-8 space-y-6">
      {/* Top Header Section with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Candidates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant details, manage status, and download records.
          </p>
        </div>

        {/* Action Toolbar for Excel & PDF Download */}
        <ExportCandidateActions />
      </div>

      {/* Candidate Data Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">All Candidate Applications</h2>
        </div>
        
        {/* Your candidate listing table or grid goes here */}
        <div className="p-6 text-xs text-slate-500 text-center">
          Candidate data list loading...
        </div>
      </div>
    </main>
  );
}