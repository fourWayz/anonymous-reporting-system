export default function ReportList({ reports, addComment, updateStatus }) {
    return (
      <div className="mt-8 space-y-4">
        {reports.map((report, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <p><strong>Content:</strong> {report.content}</p>
            <p><strong>Tag:</strong> {report.tag}</p>
            <p><strong>Status:</strong> {report.status === 0 ? 'Pending' : 'Reviewed'}</p>
            <p><strong>Comments:</strong> {report.comments.join(", ")}</p>
  
            {/* Add Comment Form */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add comment"
                className="p-2 border rounded w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addComment(report.reportId, e.target.value);
                }}
              />
            </div>
  
            {/* Update Status Button */}
            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => updateStatus(report.reportId, 1)}
            >
              Mark as Reviewed
            </button>
          </div>
        ))}
      </div>
    );
  }
  