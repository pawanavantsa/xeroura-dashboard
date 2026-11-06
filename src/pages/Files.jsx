import { LuDownload } from 'react-icons/lu';
import { AsyncBtn, useApp } from '../ui.jsx';

export default function Files() {
  const { toast, project, files } = useApp();
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="eyebrow">{project.name}</div>
          <h1>Files</h1>
        </div>
      </div>
      <div className="card table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th>File</th>
              <th>Kind</th>
              <th>When</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} style={{ cursor: 'default' }}>
                <td>
                  <div className="person">
                    <div>
                      <b>{f.name}</b>
                      <span>{f.by}</span>
                    </div>
                  </div>
                </td>
                <td className="muted">{f.kind}</td>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>{f.when}</td>
                <td style={{ textAlign: 'right', width: 1 }}>
                  <AsyncBtn
                    size="sm"
                    icon={LuDownload}
                    doneLabel="Saved"
                    onClick={async () => { await new Promise((r) => setTimeout(r, 400)); toast(`Saved ${f.name}`); }}
                  >
                    Download
                  </AsyncBtn>
                </td>
              </tr>
            ))}
            {!files.length && (
              <tr style={{ cursor: 'default' }}><td colSpan={4} className="muted" style={{ padding: 24 }}>Nothing in files yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
