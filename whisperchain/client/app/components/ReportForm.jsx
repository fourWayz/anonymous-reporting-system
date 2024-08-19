import { useState } from 'react';

export default function ReportForm({ submitReport }) {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content && tag) {
      await submitReport(content, tag);
      setContent('');
      setTag('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700">Report Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 p-2 border rounded w-full"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700">Tag</label>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="mt-1 p-2 border rounded w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit Report
      </button>
    </form>
  );
}
